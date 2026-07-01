import {
  DEFAULT_CHAT_MODEL,
  findSupportedChatModel,
  findSupportedEmbeddingModel,
  SUPPORTED_CHAT_MODELS,
  SUPPORTED_EMBEDDING_MODELS,
} from "@heho/shared";
import { Button } from "@heho/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@heho/ui/components/field";
import { Input } from "@heho/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heho/ui/components/select";
import { toast } from "@heho/ui/components/sonner";
import { Spinner } from "@heho/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import z from "zod";
import { llmProviderMutationOptions } from "@/queries/llm-provider";

const baseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Llm-provider name is required")
      .max(100, "Llm-provider name is too long"),
    baseUrl: z.url("Enter a valid url").nullable().optional(),
    apiKey: z
      .string()
      .min(1)
      .refine((value) => value.trim().length > 0, {
        message: "API key is required",
      }),
  })
  .strict();

const chatProviderSchema = baseSchema
  .extend({
    capability: z.literal("chat"),
    provider: z.string().min(1, "Provider is required"),
    model: z.string().min(1, "Model is required"),
  })
  .refine(
    ({ provider, model }) =>
      findSupportedChatModel({
        id: model,
        provider,
      }) !== undefined,
    {
      message: "Chat model is not supported by this provider",
      path: ["model"],
    }
  );

const embeddingProviderSchema = baseSchema
  .extend({
    capability: z.literal("embedding"),
    provider: z.string().min(1, "Provider is required"),
    model: z.string().min(1, "Model is required"),
  })
  .refine(
    ({ provider, model }) =>
      findSupportedEmbeddingModel({
        id: model,
        provider,
      }) !== undefined,
    {
      message: "Embedding model is not supported by this provider",
      path: ["model"],
    }
  );

const createLlmProviderFormSchema = z.discriminatedUnion("capability", [
  chatProviderSchema,
  embeddingProviderSchema,
]);

type CreateLlmProviderFormValues = z.infer<typeof createLlmProviderFormSchema>;

const getModels = (capability: CreateLlmProviderFormValues["capability"]) =>
  capability === "chat" ? SUPPORTED_CHAT_MODELS : SUPPORTED_EMBEDDING_MODELS;

const getProviders = (capability: CreateLlmProviderFormValues["capability"]) =>
  Array.from(new Set(getModels(capability).map((model) => model.provider)));

const createDefaultLlmProviderValues = (): CreateLlmProviderFormValues => ({
  name: "",
  capability: "chat",
  provider: DEFAULT_CHAT_MODEL.provider,
  model: DEFAULT_CHAT_MODEL.id,
  apiKey: "",
  baseUrl: null,
});

type CreateLlmProviderFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  organizationId: string;
  onSuccess?: () => void;
};

export const CreateLlmProviderForm = ({
  organizationId,
  onSuccess,
  ...formProps
}: CreateLlmProviderFormProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...llmProviderMutationOptions(queryClient, organizationId),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    defaultValues: createDefaultLlmProviderValues(),
    validators: {
      onBlur: createLlmProviderFormSchema,
      onSubmit: createLlmProviderFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = createLlmProviderFormSchema.parse(value);
      const baseUrl = parsed.baseUrl === "" ? null : parsed.baseUrl;

      await mutation.mutateAsync({
        ...parsed,
        baseUrl,
      });

      form.reset();
      toast.success("Llm-provider created.");
      onSuccess?.();
    },
  });

  return (
    <form
      {...formProps}
      id="create-llm-provider-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Production OpenAI"
                        required
                        type="text"
                        value={field.state.value}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="capability">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  const items = [
                    {
                      label: "Chat",
                      value: "chat",
                    },
                    {
                      label: "Embedding",
                      value: "embedding",
                    },
                  ];

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Capability</FieldLabel>
                      <Select
                        items={items}
                        onValueChange={(value) => {
                          if (value !== "chat" && value !== "embedding") {
                            return;
                          }

                          const firstModel = getModels(value)[0];

                          field.handleChange(value);
                          form.setFieldValue("provider", firstModel.provider);
                          form.setFieldValue("model", firstModel.id);
                        }}
                        value={field.state.value}
                      >
                        <SelectTrigger
                          aria-invalid={isInvalid}
                          id={field.name}
                          onBlur={field.handleBlur}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {items.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Subscribe
                selector={(state) => [
                  state.values.capability,
                  state.values.provider,
                ]}
              >
                {([capabilityString, selectedProvider]) => {
                  const capability = capabilityString as "chat" | "embedding";
                  const providers = getProviders(capability);
                  const providerItems = providers.map((provider) => ({
                    label: provider,
                    value: provider,
                  }));

                  const models = getModels(capability).filter(
                    (model) => model.provider === selectedProvider
                  );

                  const modelItems = models.map((model) => ({
                    label: model.id,
                    value: model.id,
                  }));

                  return (
                    <>
                      <form.Field name="provider">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Provider
                              </FieldLabel>
                              <Select
                                items={providerItems}
                                onValueChange={(value) => {
                                  if (!value) {
                                    return;
                                  }

                                  field.handleChange(value);

                                  const firstModel = getModels(capability).find(
                                    (model) => model.provider === value
                                  );

                                  if (firstModel) {
                                    form.setFieldValue("model", firstModel.id);
                                  }
                                }}
                                value={field.state.value}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  id={field.name}
                                  onBlur={field.handleBlur}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {providerItems.map((item) => (
                                      <SelectItem
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="model">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Model
                              </FieldLabel>
                              <Select
                                items={modelItems}
                                onValueChange={(value) => {
                                  if (value) {
                                    field.handleChange(value);
                                  }
                                }}
                                value={field.state.value}
                              >
                                <SelectTrigger
                                  aria-invalid={isInvalid}
                                  id={field.name}
                                  onBlur={field.handleBlur}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {modelItems.map((item) => (
                                      <SelectItem
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </>
                  );
                }}
              </form.Subscribe>

              <form.Field name="baseUrl">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Base URL</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="url"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Use provider default"
                        type="url"
                        value={field.state.value ?? undefined}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : (
                        <FieldDescription>
                          Leave blank to use provider default.
                        </FieldDescription>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="apiKey">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>API key</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Enter API key"
                        type="password"
                        value={field.state.value}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : (
                        <FieldDescription>
                          The key is encrypted before storage.
                        </FieldDescription>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, submitting]) => (
                  <Button
                    disabled={!canSubmit || submitting}
                    form="create-llm-provider-form"
                    type="submit"
                  >
                    {submitting && <Spinner data-icon="inline-start" />}
                    {submitting ? "Creating provider..." : "Create provider"}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </FieldSet>
        )}
      </form.Subscribe>
    </form>
  );
};
