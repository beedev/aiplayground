"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  FileText,
  Search,
} from "lucide-react"
import { ResourceTable } from "@/components/admin/resource-table"
import { ModuleForm } from "@/components/admin/module-form"
import { ModuleScanDialog } from "@/components/admin/module-scan-dialog"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { ModuleResource } from "@prisma/client"

interface ModuleWithResources {
  id: string
  slug: string
  title: string
  description: string
  order: number
  contentFilePath: string
  resources: ModuleResource[]
}

interface ModuleManagementProps {
  modules: ModuleWithResources[]
}

export function ModuleManagement({ modules: initialModules }: ModuleManagementProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [showScan, setShowScan] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleWithResources | null>(null)
  const [deletingModule, setDeletingModule] = useState<ModuleWithResources | null>(null)
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const nextOrder = initialModules.length > 0
    ? Math.max(...initialModules.map((m) => m.order)) + 1
    : 1

  async function handleMove(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= initialModules.length) return

    const reordered = [...initialModules]
    const tempOrder = reordered[index].order
    reordered[index] = { ...reordered[index], order: reordered[swapIndex].order }
    reordered[swapIndex] = { ...reordered[swapIndex], order: tempOrder }

    try {
      const res = await fetch("/api/admin/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modules: [
            { id: reordered[index].id, order: reordered[index].order },
            { id: reordered[swapIndex].id, order: reordered[swapIndex].order },
          ],
        }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast({
        title: "Error",
        description: "Failed to reorder modules.",
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!deletingModule) return
    try {
      const res = await fetch(`/api/admin/modules/${deletingModule.slug}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }
      toast({ title: "Module deleted" })
      router.refresh()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete module.",
        variant: "destructive",
      })
    } finally {
      setDeletingModule(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
          <p className="text-muted-foreground mt-1">
            Manage training modules, ordering, and resources.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScan(true)}>
            <Search className="h-4 w-4 mr-2" />
            Scan for New Files
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {initialModules.map((mod, index) => (
          <Card key={mod.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    disabled={index === initialModules.length - 1}
                    onClick={() => handleMove(index, "down")}
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="font-mono text-xs">
                  {String(mod.order).padStart(2, "0")}
                </Badge>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {mod.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {mod.resources.length} resource{mod.resources.length !== 1 ? "s" : ""}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setExpandedSlug(expandedSlug === mod.slug ? null : mod.slug)
                    }
                    title="Toggle resources"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingModule(mod)}
                    title="Edit module"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeletingModule(mod)}
                    title="Delete module"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="ml-[72px] mt-1">
                <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {mod.contentFilePath}
                </code>
              </div>
            </CardHeader>
            {expandedSlug === mod.slug && (
              <CardContent className="pt-0">
                <ResourceTable
                  moduleSlug={mod.slug}
                  resources={mod.resources}
                />
              </CardContent>
            )}
          </Card>
        ))}

        {initialModules.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No modules yet. Click &quot;Add Module&quot; to create your first one.
            </CardContent>
          </Card>
        )}
      </div>

      <ModuleForm
        open={showCreate}
        onOpenChange={setShowCreate}
        nextOrder={nextOrder}
        onSuccess={() => {
          setShowCreate(false)
          router.refresh()
        }}
      />

      {editingModule && (
        <ModuleForm
          open={!!editingModule}
          onOpenChange={(open) => {
            if (!open) setEditingModule(null)
          }}
          module={editingModule}
          nextOrder={nextOrder}
          onSuccess={() => {
            setEditingModule(null)
            router.refresh()
          }}
        />
      )}

      <ModuleScanDialog
        open={showScan}
        onOpenChange={setShowScan}
        onSuccess={() => {
          setShowScan(false)
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={!!deletingModule}
        onOpenChange={(open) => {
          if (!open) setDeletingModule(null)
        }}
        title="Delete Module"
        description={
          deletingModule
            ? `Are you sure you want to delete "${deletingModule.title}"? This will also delete all associated resources, progress tracking, and forum threads. This cannot be undone.`
            : ""
        }
        onConfirm={handleDelete}
        destructive
      />
    </div>
  )
}
