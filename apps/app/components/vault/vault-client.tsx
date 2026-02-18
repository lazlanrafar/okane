"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Trash2,
  Download,
  MoreVertical,
  Grid,
  List as ListIcon,
  Search,
  Filter,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui";
import { cn } from "@workspace/ui";

import {
  getVaultFiles,
  uploadVaultFile,
  deleteVaultFile,
  type VaultFile,
} from "@/actions/vault.actions";
import { UploadCloud } from "lucide-react";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

export function VaultClient() {
  const queryClient = useQueryClient();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["vault-files"],
    queryFn: async () => {
      const result = await getVaultFiles();
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
          "Invalid file type. Only documents and images are allowed.",
        );
      }
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadVaultFile(formData);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-files"] });
      toast.success("File uploaded successfully");
      setIsUploadOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const file = droppedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVaultFile(id);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-files"] });
      toast.success("File deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete file");
    },
  });

  const filteredFiles =
    files?.filter((f: VaultFile) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 relative min-h-[calc(100vh-180px)] flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute -inset-2 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center backdrop-blur-sm transition-all animate-in fade-in zoom-in duration-200">
          <div className="bg-background p-6 rounded-full shadow-xl mb-4">
            <UploadCloud className="h-12 w-12 text-primary animate-bounce" />
          </div>
          <p className="text-xl font-bold text-primary">
            Drop to upload your document
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Images, PDFs, or Excel files only
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vault</h1>
          <p className="text-muted-foreground text-sm">
            Manage your documents and invoices securely.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-9 w-[200px] md:w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView(view === "grid" ? "list" : "grid")}
          >
            {view === "grid" ? (
              <ListIcon className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No files found</CardTitle>
          <CardDescription>Upload some files to get started.</CardDescription>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Upload First File
          </Button>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file: VaultFile) => (
            <Card
              key={file.id}
              className="group overflow-hidden hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-0">
                <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20 hover:text-destructive"
                      onClick={() => deleteMutation.mutate(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1 border-t">
                  <span
                    className="font-medium truncate text-sm"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{formatSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Size</th>
                  <th className="px-6 py-3 text-right">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file: VaultFile) => (
                  <tr
                    key={file.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {file.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {file.type}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(file.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Select a file to upload to your vault. Max size 10MB.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
              disabled={uploadMutation.isPending}
            />
            {uploadMutation.isPending && (
              <p className="text-sm text-muted-foreground animate-pulse text-center">
                Uploading... please wait.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
