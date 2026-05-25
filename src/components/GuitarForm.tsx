import { useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CURRENCIES,
  guitarFieldsSchema,
  guitarInputSchema,
  type GuitarInput,
} from '@/domain/guitar';
import { uploadPicture, validatePictureFile } from '@/api/uploads';
import { normalizeRichTextForSubmit } from '@/lib/rich-text';
import { MoneyInput } from './MoneyInput';
import { RichTextEditor } from './RichTextEditor';

export interface GuitarFormProps {
  initialValues?: Partial<GuitarInput>;
  onSubmit: (values: GuitarInput) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  /** Errors from the server, displayed underneath the form. */
  serverError?: string | null;
}

/**
 * react-hook-form's useFieldArray requires object entries, so we wrap each
 * picture URL in `{ url }` for the form state and then unwrap on submit via
 * a zod `.transform()`. The resolver still enforces the domain rules.
 */
const formSchema = guitarFieldsSchema
  .omit({ pictures: true })
  .extend({
    pictures: z.array(z.object({ url: z.string() })).default([]),
  })
  .transform((value) => ({
    ...value,
    pictures: value.pictures.map((p) => p.url),
    description: normalizeRichTextForSubmit(value.description),
  }))
  .pipe(guitarInputSchema);

type FormShape = {
  brand: string;
  typeName: string;
  buildYear: number;
  priceAmount: number | undefined;
  priceCurrency: 'EUR' | 'USD';
  pictures: { url: string }[];
  coverPictureIndex: number;
  serialNumber?: string;
  color?: string;
  country?: string;
  factory?: string;
  description?: string;
};

const toFormShape = (v: Partial<GuitarInput> | undefined): FormShape => ({
  brand: v?.brand ?? '',
  typeName: v?.typeName ?? '',
  buildYear: v?.buildYear ?? new Date().getFullYear(),
  priceAmount: v?.priceAmount,
  priceCurrency: v?.priceCurrency ?? 'EUR',
  pictures: (v?.pictures ?? []).map((url) => ({ url })),
  coverPictureIndex: v?.coverPictureIndex ?? 0,
  serialNumber: v?.serialNumber ?? '',
  color: v?.color ?? '',
  country: v?.country ?? '',
  factory: v?.factory ?? '',
  description: v?.description ?? '',
});

export const GuitarForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = 'Save',
  serverError,
}: GuitarFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormShape, unknown, GuitarInput>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: toFormShape(initialValues),
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'pictures' });
  const coverPictureIndex = watch('coverPictureIndex') ?? 0;

  const removePicture = (index: number) => {
    const currentCover = coverPictureIndex;
    const nextCount = fields.length - 1;
    let nextCover = currentCover;
    if (nextCount === 0) {
      nextCover = 0;
    } else if (index === currentCover) {
      nextCover = 0;
    } else if (index < currentCover) {
      nextCover = currentCover - 1;
    }
    remove(index);
    setValue('coverPictureIndex', nextCover);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(files)) {
      const validationError = validatePictureFile(file);
      if (validationError) {
        setUploadError(validationError);
        continue;
      }

      setUploadingCount((count) => count + 1);
      try {
        const publicUrl = await uploadPicture(file);
        append({ url: publicUrl });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploadError(message);
      } finally {
        setUploadingCount((count) => count - 1);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isUploading = uploadingCount > 0;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="brand" className="label">
            Brand
          </label>
          <input
            id="brand"
            className="input"
            aria-invalid={Boolean(errors.brand)}
            {...register('brand')}
          />
          {errors.brand ? <p className="error-text">{errors.brand.message}</p> : null}
        </div>

        <div>
          <label htmlFor="typeName" className="label">
            Type
          </label>
          <input
            id="typeName"
            className="input"
            aria-invalid={Boolean(errors.typeName)}
            {...register('typeName')}
          />
          {errors.typeName ? <p className="error-text">{errors.typeName.message}</p> : null}
        </div>

        <div>
          <label htmlFor="buildYear" className="label">
            Build year
          </label>
          <input
            id="buildYear"
            type="number"
            className="input"
            aria-invalid={Boolean(errors.buildYear)}
            {...register('buildYear', { valueAsNumber: true })}
          />
          {errors.buildYear ? <p className="error-text">{errors.buildYear.message}</p> : null}
        </div>

        <div>
          <label htmlFor="serialNumber" className="label">
            Serial number
          </label>
          <input
            id="serialNumber"
            className="input"
            aria-invalid={Boolean(errors.serialNumber)}
            {...register('serialNumber')}
          />
          <p className="help">Optional.</p>
        </div>

        <div>
          <label htmlFor="color" className="label">
            Color
          </label>
          <input id="color" className="input" aria-invalid={Boolean(errors.color)} {...register('color')} />
          <p className="help">Optional.</p>
        </div>

        <div>
          <label htmlFor="country" className="label">
            Country (made in)
          </label>
          <input
            id="country"
            className="input"
            aria-invalid={Boolean(errors.country)}
            {...register('country')}
          />
          <p className="help">Optional.</p>
        </div>

        <div>
          <label htmlFor="factory" className="label">
            Factory
          </label>
          <input
            id="factory"
            className="input"
            aria-invalid={Boolean(errors.factory)}
            {...register('factory')}
          />
          <p className="help">Optional.</p>
        </div>

        <div>
          <label htmlFor="priceAmount" className="label">
            Price
          </label>
          <Controller
            control={control}
            name="priceAmount"
            render={({ field }) => (
              <MoneyInput
                id="priceAmount"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={Boolean(errors.priceAmount)}
              />
            )}
          />
          <p className="help">Enter the price in major units (e.g. 1999.00).</p>
          {errors.priceAmount ? (
            <p className="error-text">{errors.priceAmount.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="priceCurrency" className="label">
            Currency
          </label>
          <select
            id="priceCurrency"
            className="input"
            aria-invalid={Boolean(errors.priceCurrency)}
            {...register('priceCurrency')}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.priceCurrency ? (
            <p className="error-text">{errors.priceCurrency.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              id="description"
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={submitting || isUploading}
              aria-invalid={Boolean(errors.description)}
            />
          )}
        />
        {errors.description ? (
          <p className="error-text">{errors.description.message}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="label">Pictures</legend>
        {fields.length === 0 ? (
          <p className="help">No pictures uploaded yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {fields.map((field, index) => {
              const isCover = index === coverPictureIndex;
              return (
              <li
                key={field.id}
                className={`relative aspect-square overflow-hidden rounded-md border bg-white ${
                  isCover ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'
                }`}
              >
                <img
                  src={field.url}
                  alt={`Uploaded picture ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {isCover && fields.length > 1 ? (
                  <span className="absolute left-1 top-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                    Overview
                  </span>
                ) : null}
                <div className="absolute inset-x-1 bottom-1 flex flex-col gap-1.5">
                  {!isCover && fields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setValue('coverPictureIndex', index)}
                      className="min-h-9 touch-manipulation rounded-md bg-white/95 px-2 py-1.5 text-xs font-medium text-slate-900 hover:bg-white"
                    >
                      Use for overview
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removePicture(index)}
                    className="min-h-9 touch-manipulation rounded-md bg-white/95 px-2 py-1.5 text-xs font-medium text-slate-900 hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
            })}
          </ul>
        )}
        {fields.length > 1 ? (
          <p className="help mt-2">
            Choose which picture appears on the overview page.
          </p>
        ) : null}
        <input type="hidden" {...register('coverPictureIndex', { valueAsNumber: true })} />
        {errors.pictures && !Array.isArray(errors.pictures) ? (
          <p className="error-text">{(errors.pictures as { message?: string }).message}</p>
        ) : null}
        {uploadError ? <p className="error-text">{uploadError}</p> : null}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            id="picture-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            aria-label="Upload pictures"
            onChange={(e) => void handleFilesSelected(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full sm:w-auto"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading…' : 'Upload pictures'}
          </button>
          <p className="help sm:mt-0">JPEG, PNG, WebP, or GIF up to 5 MB each.</p>
        </div>
      </fieldset>

      {serverError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <p className="font-semibold">The server rejected the request:</p>
          <p>{serverError}</p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
          disabled={submitting || isUploading}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
