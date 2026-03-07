"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, FileDown } from "lucide-react"

interface ScannedModule {
  filePath: string
  fileName: string
  title: string
  description: string
  suggestedSlug: string
  suggestedOrder: number
}

interface ModuleScanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ModuleScanDialog({ open, onOpenChange, onSuccess }: ModuleScanDialogProps) {
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const [modules, setModules] = useState<ScannedModule[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, Partial<ScannedModule>>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setScanning(true)
      setModules([])
      setSelected(new Set())
      setEdits({})
      fetch("/api/admin/modules/scan")
        .then(res => res.json())
        .then((data: ScannedModule[]) => {
          setModules(data)
          setSelected(new Set(data.map(m => m.filePath)))
        })
        .catch(() => {
          toast({ title: "Error", description: "Failed to scan for modules.", variant: "destructive" })
        })
        .finally(() => setScanning(false))
    }
  }, [open, toast])

  function getEdited(mod: ScannedModule) {
    const e = edits[mod.filePath] || {}
    return {
      slug: e.suggestedSlug ?? mod.suggestedSlug,
      title: e.title ?? mod.title,
      description: e.description ?? mod.description,
      order: e.suggestedOrder ?? mod.suggestedOrder,
    }
  }

  function updateEdit(filePath: string, field: string, value: string | number) {
    setEdits(prev => ({
      ...prev,
      [filePath]: { ...prev[filePath], [field]: value },
    }))
  }

  function toggleSelect(filePath: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(filePath)) next.delete(filePath)
      else next.add(filePath)
      return next
    })
  }

  async function handleImport() {
    const toImport = modules
      .filter(m => selected.has(m.filePath))
      .map(m => {
        const edited = getEdited(m)
        return {
          slug: edited.slug,
          title: edited.title,
          description: edited.description,
          order: edited.order,
          contentFilePath: m.filePath,
        }
      })

    if (toImport.length === 0) return

    setImporting(true)
    try {
      const res = await fetch("/api/admin/modules/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: toImport }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Import failed")
      }
      toast({ title: `Imported ${toImport.length} module(s)` })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to import modules.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan for New Modules</DialogTitle>
          <DialogDescription>
            Discover unregistered markdown files in content/modules/ and import them.
          </DialogDescription>
        </DialogHeader>

        {scanning ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Scanning files...</span>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No unregistered markdown files found.</p>
            <p className="text-xs mt-1">All files in content/modules/ are already registered.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {modules.map(mod => {
                const edited = getEdited(mod)
                const isSelected = selected.has(mod.filePath)
                return (
                  <div
                    key={mod.filePath}
                    className={`border rounded-lg p-3 transition-colors ${isSelected ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200 opacity-60"}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(mod.filePath)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1 space-y-2">
                        <code className="text-xs text-muted-foreground">{mod.fileName}</code>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={edited.title}
                            onChange={e => updateEdit(mod.filePath, "title", e.target.value)}
                            placeholder="Title"
                            className="text-sm"
                            disabled={!isSelected}
                          />
                          <Input
                            value={edited.slug}
                            onChange={e => updateEdit(mod.filePath, "suggestedSlug", e.target.value)}
                            placeholder="slug"
                            className="text-sm font-mono"
                            disabled={!isSelected}
                          />
                        </div>
                        <Input
                          value={edited.description}
                          onChange={e => updateEdit(mod.filePath, "description", e.target.value)}
                          placeholder="Description"
                          className="text-sm"
                          disabled={!isSelected}
                        />
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={edited.order}
                        onChange={e => updateEdit(mod.filePath, "suggestedOrder", parseInt(e.target.value) || 1)}
                        className="w-16 text-sm"
                        disabled={!isSelected}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">
                {selected.size} of {modules.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing || selected.size === 0}>
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Import {selected.size} Module{selected.size !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
