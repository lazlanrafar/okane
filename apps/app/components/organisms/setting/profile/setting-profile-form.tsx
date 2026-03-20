"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  cn,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Skeleton,
} from "@workspace/ui";

function SettingProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Separator />
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32 rounded-none" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full max-w-md rounded-none" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full max-w-md rounded-none" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-8 w-28 rounded-none" />
    </div>
  );
}
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  getMe,
  updateProfileAction,
  updateAvatarAction,
} from "@workspace/modules/user/user.action";

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
        update_profile: string;
        toast_submitted: string;
      };
    };
  };
}

export function SettingProfileForm({ dictionary }: SettingProfileFormProps) {
  const { profile } = dictionary.settings;
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = React.useState(false);

  // 1. Fetch real user data
  const { data: meData, isLoading: isMeLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const result = await getMe();
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  });

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
      } as any)
      .email(),
    profile_picture: z.string().optional(),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema as any),
    defaultValues: {
      username: "",
      email: "",
      profile_picture: "",
    },
    mode: "onChange",
  });

  // 2. Sync form values when data is loaded
  React.useEffect(() => {
    if (meData?.user) {
      form.reset({
        username: meData.user.name || "",
        email: meData.user.email,
        profile_picture: meData.user.profile_picture || "",
      });
    }
  }, [meData, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const result = await updateProfileAction({
        name: data.username,
        profile_picture: data.profile_picture,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      toast.error(`Error: ${(error as Error).message}`);
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateMutation.mutate(data);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await updateAvatarAction(formData);

      if (response.success && response.data?.url) {
        const newUrl = response.data.url;
        form.setValue("profile_picture", newUrl);
        toast.success("Profile picture updated automatically");
        // Invalidate "me" query so global avatar updates
        queryClient.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.error(response.error || "Failed to upload photo");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  if (isMeLoading) {
    return <SettingProfileSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">{profile.title}</h3>
        <p className="text-muted-foreground text-sm">{profile.description}</p>
      </div>
      <Separator className="my-6" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.getValues("profile_picture")} />
              <AvatarFallback className="text-xl">
                {form.getValues("username")?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <FormLabel>Profile Photo</FormLabel>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs rounded-none"
                  disabled={isUploading}
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload New
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                JPG, GIF or PNG. 10MB max.
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{profile.username.label}</FormLabel>
                <FormControl>
                  <Input placeholder={profile.username.placeholder} {...field} className="rounded-none max-w-md" />
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
                <FormControl>
                  <Input disabled {...field} className="rounded-none max-w-md" />
                </FormControl>
                <FormDescription>{profile.email.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="rounded-none text-xs h-8"
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {profile.update_profile}
          </Button>
        </form>
      </Form>
    </div>
  );
}
