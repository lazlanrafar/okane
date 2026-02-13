"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useFieldArray } from "react-hook-form";

import { cn } from "@workspace/ui";
import { Button } from "@workspace/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui";
import { Input } from "@workspace/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { Textarea } from "@workspace/ui";
import { toast } from "sonner";

interface SettingProfileFormProps {
  dictionary: {
    settings: {
      profile: {
        title: string;
        description: string;
        username: {
          label: string;
          placeholder: string;
          description: string;
          error_min: string;
          error_max: string;
        };
        email: {
          label: string;
          placeholder: string;
          description: string;
          error_required: string;
        };
        bio: {
          label: string;
          placeholder: string;
          description: string;
        };
        urls: {
          label: string;
          description: string;
          add_url: string;
          error_invalid: string;
        };
        update_profile: string;
        toast_submitted: string;
      };
    };
  };
}

const defaultValues = {
  username: "shadcn",
  bio: "I own a computer.",
  urls: [
    { value: "https://shadcn.com" },
    { value: "http://twitter.com/shadcn" },
  ],
};

export function SettingProfileForm({ dictionary }: SettingProfileFormProps) {
  const { profile } = dictionary.settings;

  const profileFormSchema = z.object({
    username: z
      .string()
      .min(2, {
        message: profile.username.error_min,
      })
      .max(30, {
        message: profile.username.error_max,
      }),
    email: z
      .string({
        required_error: profile.email.error_required,
      })
      .email(),
    bio: z.string().max(160).min(4),
    urls: z
      .array(
        z.object({
          value: z.string().url({ message: profile.urls.error_invalid }),
        }),
      )
      .optional(),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  });

  function onSubmit(data: ProfileFormValues) {
    toast(profile.toast_submitted, {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{profile.username.label}</FormLabel>
              <FormControl>
                <Input placeholder={profile.username.placeholder} {...field} />
              </FormControl>
              <FormDescription>{profile.username.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{profile.email.label}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={profile.email.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="m@example.com">m@example.com</SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {/* Note: Breaking up the link inside description is tricky with just strings. 
                    For now, I'll strip the HTML or assume the translation includes the full text 
                    The current translation says: "You can manage verified email addresses in your email settings."
                    I'll render it as text, or if I want the link, I'd need rich text support.
                    For simplicity/robustness, I'll just render the string and maybe append the link or keep the link part separate if needed.
                    However, the original had a Link component in the middle. 
                    I'll just leave the link static for now or include it if the translation allows interpolation (which simple JSON doesn't).
                    I will use the translated description.
                */}
                {profile.email.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{profile.bio.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={profile.bio.placeholder}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>{profile.bio.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    {profile.urls.label}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    {profile.urls.description}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            {profile.urls.add_url}
          </Button>
        </div>
        <Button type="submit">{profile.update_profile}</Button>
      </form>
    </Form>
  );
}
