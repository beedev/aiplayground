import fs from "fs"
import path from "path"

export interface UnregisteredModule {
  filePath: string
  fileName: string
  title: string
  description: string
  suggestedSlug: string
  suggestedOrder: number
}

export function extractMetadataFromMarkdown(content: string): { title: string; description: string } {
  const lines = content.split("\n")
  let title = "Untitled Module"
  let description = ""
  let foundTitle = false

  for (const line of lines) {
    const titleMatch = line.match(/^#\s+(.+)$/)
    if (!foundTitle && titleMatch) {
      title = titleMatch[1].trim()
      foundTitle = true
      continue
    }
    if (foundTitle && !description) {
      const trimmed = line.trim()
      // Skip empty lines, blockquotes (>), and --- separators
      if (!trimmed || trimmed.startsWith(">") || trimmed === "---") continue
      // Skip headers
      if (trimmed.startsWith("#")) continue
      description = trimmed.slice(0, 200)
    }
    if (foundTitle && description) break
  }

  return { title, description: description || title }
}

export function slugFromFilename(fileName: string): string {
  return fileName
    .replace(/\.md$/, "")
    .replace(/^\d+-/, "")  // strip leading number prefix
}

export async function scanUnregisteredModules(): Promise<UnregisteredModule[]> {
  // Dynamic import prisma to avoid issues in client bundles
  const { prisma } = await import("@/lib/prisma")

  const contentDir = path.join(process.cwd(), "content", "modules")

  if (!fs.existsSync(contentDir)) return []

  const allFiles = fs.readdirSync(contentDir).filter(f => f.endsWith(".md")).sort()

  const registered = await prisma.module.findMany({
    select: { contentFilePath: true },
  })
  const registeredPaths = new Set(registered.map(m => m.contentFilePath))

  const maxOrder = await prisma.module.aggregate({ _max: { order: true } })
  let nextOrder = (maxOrder._max.order ?? 0) + 1

  const unregistered: UnregisteredModule[] = []

  for (const fileName of allFiles) {
    const filePath = `content/modules/${fileName}`
    if (registeredPaths.has(filePath)) continue

    const fullPath = path.join(contentDir, fileName)
    const content = fs.readFileSync(fullPath, "utf-8")
    const { title, description } = extractMetadataFromMarkdown(content)

    unregistered.push({
      filePath,
      fileName,
      title,
      description,
      suggestedSlug: slugFromFilename(fileName),
      suggestedOrder: nextOrder++,
    })
  }

  return unregistered
}

export function getModuleContent(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    return fs.readFileSync(fullPath, "utf-8")
  } catch {
    return "# Content Coming Soon\n\nThis module's content is being prepared."
  }
}

export function extractExercise(markdown: string): {
  content: string
  exercise: string
} {
  const exerciseMatch = markdown.split(/^## Exercise/m)
  if (exerciseMatch.length > 1) {
    return {
      content: exerciseMatch[0].trim(),
      exercise: exerciseMatch[1].trim(),
    }
  }
  return { content: markdown, exercise: "" }
}
