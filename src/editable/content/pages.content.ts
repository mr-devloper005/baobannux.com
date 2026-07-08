import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'An open reference library of references and resources',
      description: 'Browse a curated reference library of references, collections, and resources — organized for fast discovery and ready to open.',
      openGraphTitle: 'An open reference library of references and resources',
      openGraphDescription: 'Browse a curated reference library of references, collections, and resources, organized for fast discovery and ready to open.',
      keywords: ['reference library', 'references', 'resources', 'collections', 'downloads'],
    },
    hero: {
      badge: 'An open reference library',
      title: ['A well-kept library', 'of references worth keeping.'],
      description:
        'Browse references, collections, and resources gathered into one dependable library — organized by topic and ready to open the moment you need them.',
      primaryCta: { label: 'Open the library', href: '/pdf' },
      secondaryCta: { label: 'Search references', href: '/search' },
      searchPlaceholder: 'Search references, collections, and resources',
      focusLabel: 'Focus',
      featureCardBadge: 'latest in the library',
      featureCardTitle: 'The newest references stay front and center.',
      featureCardDescription: 'Recently added references and collections lead the home page so the most current material is always one click away.',
    },
    intro: {
      badge: 'About the library',
      title: 'Built for finding, opening, and keeping the references you rely on.',
      paragraphs: [
        'The library gathers references, collections, and resources into one place so you can move from a topic to the exact reference without friction.',
        'Instead of scattering material across disconnected pages, everything is grouped into clear collections with consistent navigation and fast discovery.',
        'Whether you start from a collection, a search, or the latest additions, you can keep finding related references without losing your place.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A discovery-first home page that surfaces the newest references.',
        'Collections that group references and resources by topic.',
        'A calm browsing rhythm designed to make finding material easier.',
        'Clean previews and direct downloads on every reference.',
      ],
      primaryLink: { label: 'Open the library', href: '/pdf' },
      secondaryLink: { label: 'Search references', href: '/search' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'Everything worth referencing, in one calm library.',
      description: 'Move between references, collections, and resources through one clear, connected library built for fast discovery.',
      primaryCta: { label: 'Open the library', href: '/pdf' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest references in this collection.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'A calmer, clearer way to find references.',
    description: `${slot4BrandConfig.siteName} is built to make references, collections, and resources feel like one dependable, easy-to-search library.`,
    paragraphs: [
      'Instead of scattering material across disconnected pages, the library keeps related references easy to move through and easy to understand.',
      'Whether you start from a collection, a search, or the latest additions, you can keep finding useful references without losing context.',
    ],
    values: [
      {
        title: 'Organized collections',
        description: 'References are grouped into clear collections so you can go from a topic to the exact reference without noise.',
      },
      {
        title: 'Fast, focused discovery',
        description: 'Search and browsing are tuned for finding material quickly, with clean previews and direct downloads on every reference.',
      },
      {
        title: 'Dependable and current',
        description: 'New references are added continuously and the freshest, most relevant material is surfaced first.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'A support page that matches the library, not a generic contact form.',
    description: 'Tell us what you are trying to find, submit, or fix. We will route it through the right lane instead of forcing every request into the same bucket.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search references, collections, and resources across the reference library.',
    },
    hero: {
      badge: 'Search the library',
      title: 'Find the reference you need, faster.',
      description: 'Use keywords and collections to discover references and resources from across the reference library.',
      placeholder: 'Search by keyword, topic, or collection',
    },
    resultsTitle: 'Latest in the library',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a new reference for the library.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to submit a reference.',
      description: 'Use your account to open the workspace and submit references and resources to the reference library.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Submit a reference to the library.',
      description: 'Add the details, attach the file, and prepare a clean reference entry with a summary, links, and body content.',
    },
    formTitle: 'Reference details',
    submitLabel: 'Submit reference',
    successTitle: 'Reference submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back to your publishing space.',
      description: 'Login to continue browsing, managing submissions, and creating new content from your account.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Site access',
      title: 'Create your account and start publishing.',
      description: 'Create an account to access the publishing workspace, save details, and submit content through the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'From the library',
      fallbackDescription: 'Details will appear here once available.',
      visitButton: 'Visit website',
    },
  },
} as const
