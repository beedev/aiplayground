import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const newModules = [
  {
    slug: "ai-dev-best-practices",
    title: "AI-Assisted Dev Best Practices & Governance",
    description: "Trust gradient, governance frameworks, legal considerations, metrics, rollout plans, and anti-patterns for AI-assisted development.",
    order: 11,
    contentFilePath: "content/modules/11-ai-dev-best-practices.md",
  },
  {
    slug: "ai-boundary-enforcement",
    title: "AI Boundary Enforcement",
    description: "CODEOWNERS integration, path guards, agent sandboxing, and cross-team protocols for enforcing AI boundaries.",
    order: 12,
    contentFilePath: "content/modules/12-ai-boundary-enforcement.md",
  },
  {
    slug: "ai-development-lifecycle",
    title: "AI-Enabled Development Lifecycle",
    description: "GOTCHA framework, SRC validation, and the 7-phase AI development lifecycle from analysis to deployment.",
    order: 13,
    contentFilePath: "content/modules/13-ai-development-lifecycle.md",
  },
  {
    slug: "ai-hybrid-workflow",
    title: "AI + Manual Hybrid Workflow",
    description: "Sprint ceremonies, story decomposition, and daily workflow patterns for teams combining AI and manual development.",
    order: 14,
    contentFilePath: "content/modules/14-ai-hybrid-workflow.md",
  },
  {
    slug: "git-multi-user-playbook",
    title: "Git Multi-User Playbook",
    description: "Branching models, merge queues, bot governance, and monorepo strategies for multi-user AI-assisted Git workflows.",
    order: 15,
    contentFilePath: "content/modules/15-git-multi-user-playbook.md",
  },
  {
    slug: "htc-ai-dev-pov",
    title: "HTC AI-Assisted Development POV",
    description: "HTC's strategic framework for safe, scalable AI-enabled software engineering including Trust Gradient, 5 principles, and scaling roadmap.",
    order: 16,
    contentFilePath: "content/modules/16-htc-ai-dev-pov.md",
  },
]

async function main() {
  for (const mod of newModules) {
    const existing = await prisma.module.findUnique({ where: { slug: mod.slug } })
    if (existing) {
      console.log(`⏭️  Skipping "${mod.title}" — already exists`)
      continue
    }
    await prisma.module.create({ data: mod })
    console.log(`✅ Created module: ${mod.title}`)
  }
  console.log("\nDone! All 6 modules registered.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
