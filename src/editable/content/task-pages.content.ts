import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Reading desk',
    headline: 'Long-form articles with a calmer editorial rhythm.',
    description: 'Use this page for essays, guides, explainers, and story-led posts. The layout should feel like a publication, not a directory.',
    filterLabel: 'Choose article topic',
    secondaryNote: 'Reading surfaces need space, hierarchy, and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Fast-moving classifieds, offers, and time-sensitive posts.',
    description: 'Classified content should feel quick to scan, practical, and action-oriented with less editorial decoration.',
    filterLabel: 'Filter classified category',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Fast scan', 'Offers', 'Action cues'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Social bookmarks arranged like curated collections.',
    description: 'Bookmark pages should feel like shelves of useful resources, tools, references, and collections.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    eyebrow: 'Contributor',
    headline: 'A contributor record with identity, trust, and reputation cues.',
    description: 'The contributor page presents the person behind the references with credibility cues and a link into their material in the library.',
    filterLabel: 'Filter contributor category',
    secondaryNote: 'Make identity and credibility visible before the material begins.',
    chips: ['Identity first', 'Trust cues', 'Verified record'],
  },
  pdf: {
    eyebrow: 'Reference Library',
    headline: 'References, collections, and resources in one open library.',
    description: 'The library gathers references you can open or download — organized into collections and ready the moment you need them.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Reference surfaces need collection cues, file context, and clear browsing.',
    chips: ['References', 'Collections', 'Ready to open'],
  },
  listing: {
    eyebrow: 'Business directory',
    headline: 'Business listings built for discovery and comparison.',
    description: 'Listing pages should behave like a directory with trust cues, metadata, and a practical search rhythm.',
    filterLabel: 'Filter business category',
    secondaryNote: 'Prioritize comparison, location, and direct action paths.',
    chips: ['Directory', 'Compare', 'Business discovery'],
  },
  image: {
    eyebrow: 'Visual gallery',
    headline: 'Image posts with a gallery-first browsing experience.',
    description: 'Image pages should lead with visual impact, stronger cards, and a portfolio-like rhythm.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
