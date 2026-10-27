"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT, whatsapp } from "./content";

const { form } = CONTACT;

type FieldName = keyof typeof form.fields;
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["name", "eventType", "date", "guests", "venue", "details"];

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name) errors.name = form.fields.name.error;
  if (!values.eventType) errors.eventType = form.fields.eventType.error;
  if (values.guests && (!/^\d{1,5}$/.test(values.guests) || Number(values.guests) < 1)) {
    errors.guests = form.fields.guests.error;
  }
  return errors;
}

/** The text of the WhatsApp message: a greeting, then one line per answer the visitor gave. */
function buildMessage(values: Values): string {
  const lines = FIELD_ORDER.filter((name) => values[name]).map(
    (name) => `${form.fields[name].summary}: ${values[name]}`,
  );
  return [form.messageGreeting, "", ...lines].join("\n");
}

const label = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const control =
  "block w-full border-0 border-b border-ink/30 bg-transparent px-0 text-[17px] text-ink outline-none transition-colors duration-300 placeholder:text-ink-soft/60 focus:border-ink aria-invalid:border-clay";

type FieldProps = {
  name: FieldName;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    name: FieldName;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
    required: boolean | undefined;
  }) => React.ReactNode;
};

/** A label, its control and its error message, wired together for screen readers. */
function Field({ name, error, required, className, children }: FieldProps) {
  const id = `contact-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className={cn(label, "block")}>
        {form.fields[name].label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? `${id}-error` : undefined,
        "aria-required": required || undefined,
        required: required || undefined,
      })}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[13.5px] leading-[1.3] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The enquiry form. It checks the answers, then opens WhatsApp with them written out as a message;
 * nothing is sent to or stored on a server. See the note above `CONTACT` in content.ts.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const values = Object.fromEntries(
      FIELD_ORDER.map((name) => [name, String(data.get(name) ?? "").trim()]),
    ) as Values;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      setSentUrl(null);
      (formElement.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    const url = whatsapp(buildMessage(values));
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
  }

  /** Clears a field's error as soon as the visitor starts fixing it. */
  function onInput(event: FormEvent<HTMLFormElement>) {
    const { name } = event.target as HTMLInputElement;
    if (name in errors) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  const f = form.fields;

  return (
    <form id={form.id} noValidate onSubmit={onSubmit} onInput={onInput} className="scroll-mt-8">
      <h2 className="text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink">
        {form.title}
      </h2>
      <p className="mt-4 max-w-[30rem] text-[17px] leading-[1.45] text-ink-soft">{form.intro}</p>

      <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
        <Field name="name" error={errors.name} required>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              placeholder={f.name.placeholder}
              className={cn(control, "h-11")}
            />
          )}
        </Field>

        <Field name="eventType" error={errors.eventType} required>
          {(props) => (
            <div className="relative">
              <select
                {...props}
                defaultValue=""
                className={cn(control, "h-11 appearance-none pr-7 invalid:text-ink-soft/60")}
              >
                <option value="" disabled>
                  {f.eventType.placeholder}
                </option>
                {f.eventType.options.map((option) => (
                  <option key={option} value={option} className="text-ink">
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-ink-soft"
                strokeWidth={1.3}
                aria-hidden="true"
              />
            </div>
          )}
        </Field>

        <Field name="date" error={errors.date}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="off"
              placeholder={f.date.placeholder}
              className={cn(control, "h-11")}
            />
          )}
        </Field>

        <Field name="guests" error={errors.guests}>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={f.guests.placeholder}
              className={cn(control, "h-11")}
            />
          )}
        </Field>

        <Field name="venue" error={errors.venue} className="sm:col-span-2">
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="off"
              placeholder={f.venue.placeholder}
              className={cn(control, "h-11")}
            />
          )}
        </Field>

        <Field name="details" error={errors.details} className="sm:col-span-2">
          {(props) => (
            <textarea
              {...props}
              rows={4}
              placeholder={f.details.placeholder}
              className={cn(control, "resize-y py-3 leading-[1.5]")}
            />
          )}
        </Field>
      </div>

      <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
        <button
          type="submit"
          className="group inline-flex h-[46px] items-center gap-2.5 bg-forest px-[30px] text-[15px] leading-none tracking-[0.02em] text-cream transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          {form.submitLabel}
          <ArrowRight
            className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </button>
        <p className="max-w-[20rem] text-[13.5px] leading-[1.4] text-ink-soft">
          {form.privacyNote} {form.requiredNote}
        </p>
      </div>

      <div role="status" aria-live="polite">
        {sentUrl && (
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-[22px] leading-[1.15] text-ink italic">{form.sent.title}</p>
            <p className="mt-2 max-w-[30rem] text-[15.5px] leading-[1.45] text-ink-soft">
              {form.sent.body}
            </p>
            <a
              href={sentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border-b border-ink-soft/70 pb-[3px] text-[10px] leading-none font-medium tracking-[0.2em] text-ink-soft uppercase transition-colors outline-none hover:border-ink hover:text-ink focus-visible:text-ink"
            >
              {form.sent.linkLabel}
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
