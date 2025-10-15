{
  "brand_attributes": ["professional", "calm", "trustworthy", "precise", "data-first"],
  "design_personality": "Modern business SaaS with quiet confidence. Strong typographic hierarchy, generous whitespace, restrained color, and soft elevation. Information density increases progressively from overview to detail.",

  "color_system": {
    "rationale": "Project mgmt requires clarity and long reading sessions. Use cool neutrals with ocean teal accents and warm sand for contrast. Avoid saturated dark gradients.",
    "semantic_palette": {
      "bg": "hsl(210 20% 98%)",
      "bg-elevated": "hsl(0 0% 100%)",
      "surface-muted": "hsl(210 16% 95%)",
      "ink": "hsl(222 47% 11%)",
      "ink-muted": "hsl(215 16% 35%)",
      "brand": "hsl(188 60% 36%)", 
      "brand-hover": "hsl(188 60% 30%)",
      "brand-soft": "hsl(188 55% 92%)",
      "accent-sand": "hsl(35 45% 92%)",
      "accent-mist": "hsl(200 35% 97%)",
      "success": "hsl(158 60% 40%)",
      "warning": "hsl(35 90% 50%)",
      "danger": "hsl(0 72% 50%)",
      "info": "hsl(198 80% 43%)",
      "border": "hsl(210 16% 86%)",
      "ring": "hsl(188 60% 36%)",
      "chart-1": "hsl(188 60% 36%)",
      "chart-2": "hsl(15 65% 55%)",
      "chart-3": "hsl(210 30% 45%)",
      "chart-4": "hsl(158 55% 40%)",
      "chart-5": "hsl(35 70% 48%)"
    },
    "dark_mode_overrides": {
      "bg": "hsl(222 14% 10%)",
      "bg-elevated": "hsl(222 14% 14%)",
      "surface-muted": "hsl(222 12% 16%)",
      "ink": "hsl(210 20% 98%)",
      "ink-muted": "hsl(215 16% 70%)",
      "brand": "hsl(188 60% 44%)",
      "brand-hover": "hsl(188 60% 50%)",
      "brand-soft": "hsl(188 50% 20%)",
      "accent-sand": "hsl(35 30% 18%)",
      "accent-mist": "hsl(210 22% 12%)",
      "border": "hsl(222 10% 24%)",
      "ring": "hsl(188 60% 44%)"
    },
    "css_custom_properties": """
      @layer base {
        :root {
          --brand: 188 60% 36%;
          --brand-contrast: 0 0% 100%;
          --accent-sand: 35 45% 92%;
          --accent-mist: 200 35% 97%;
          --ink-muted: 215 16% 35%;
          --success: 158 60% 40%;
          --warning: 35 90% 50%;
          --danger: 0 72% 50%;
          --radius-sm: 0.375rem;
          --radius-md: 0.625rem;
          --radius-lg: 0.875rem;
          --shadow-1: 0 2px 8px rgba(15, 23, 42, 0.06);
          --shadow-2: 0 8px 24px rgba(15, 23, 42, 0.08);
          --btn-radius: 0.5rem;
          --btn-shadow: 0 6px 16px rgba(0,0,0,.08);
          --focus-ring: 0 0 0 3px hsl(var(--brand)/.25);
        }
        .dark {
          --accent-sand: 35 30% 18%;
          --accent-mist: 210 22% 12%;
          --ink-muted: 215 16% 70%;
          --shadow-1: 0 1px 4px rgba(0,0,0,.45);
          --shadow-2: 0 10px 30px rgba(0,0,0,.5);
        }
      }
    """,
    "gradients": {
      "hero_bg": "linear-gradient(135deg, hsl(188 55% 96%) 0%, hsl(200 30% 98%) 50%, hsl(35 50% 96%) 100%)",
      "accent_strip": "linear-gradient(90deg, hsl(188 60% 92%), hsl(35 45% 92%))",
      "rules": "Keep gradients below 20% of viewport height. Use only for section backgrounds or hero. Never on dense text blocks or small UI elements."
    }
  },

  "typography": {
    "fonts": {
      "display": "Space Grotesk",
      "body": "Karla",
      "mono": "Azeret Mono"
    },
    "import": "<link href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Karla:wght@400;500;600;700&family=Azeret+Mono:wght@400;600&display=swap\" rel=\"stylesheet\">",
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl tracking-tight",
      "h2": "text-base sm:text-lg font-semibold text-ink",
      "h3": "text-lg font-semibold",
      "body": "text-sm sm:text-base leading-7",
      "small": "text-xs text-muted-foreground"
    },
    "usage": "Use Space Grotesk for page titles and key numbers. Karla for all body, tables, forms. Azeret Mono for codes, IDs, sprint numbers."
  },

  "layout_grid": {
    "breakpoints": {
      "sm": 640,
      "md": 768,
      "lg": 1024,
      "xl": 1280
    },
    "containers": {
      "default": "mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]",
      "full": "mx-auto px-4 sm:px-6 lg:px-10 max-w-[1440px]"
    },
    "patterns": [
      "Dashboard: split layout — fixed sidebar (72–80px collapsed / 240px expanded), top bar, content with 12-col grid",
      "Bento on overview: 12-col grid with 2–3 row tracks, cards of 3, 4, 5 col spans",
      "Detail pages: two-column — main (8–9 cols) + meta panel (3–4 cols)"
    ]
  },

  "navigation": {
    "topbar": "Use ./components/ui/menubar or navigation-menu for product switcher, quick create, user menu. Add breadcrumb on project/task pages via ./components/ui/breadcrumb.",
    "sidebar": "Collapsible sheet/drawer on mobile (./components/ui/sheet). On desktop, fixed sidebar with icons + labels (./components/ui/navigation-menu or custom list)."
  },

  "pages_structure": {
    "auth": ["Login", "Register", "Forgot password"],
    "dashboard": ["My projects", "Late/At risk", "Upcoming milestones", "Resource load", "Costs snapshot"],
    "projects": ["List (CRUD)", "Detail with tabs: Overview | Tasks | Resources | Costs | Documents | Relationships"],
    "tasks": ["Kanban | List | Gantt (timeline) placeholder", "Baseline freeze control", "Dependencies"],
    "resources": ["People & Assets", "Allocation calendar", "Utilization charts"],
    "costs": ["Budget vs Actual", "Burn rate", "Purchase orders"],
    "documents": ["Project documents", "Images", "Relationships"],
    "relationships": ["Macro graph across projects", "Per-project graph"]
  },

  "role_based_ui": {
    "admin": "Access to Admin menu: manage users, roles, global resources, org-level settings. Display red-accent warning badges on destructive actions.",
    "project_manager": "Can create projects, freeze baselines, approve allocations/costs, manage docs and relationships.",
    "team_member": "Restricted to assigned tasks/documents. Read-only on costs. No baseline freeze toggle."
  },

  "document_management_ui": {
    "categories": ["project-documents", "images", "relationships"],
    "layout": "Left filter (tags, type, owner), main file grid list (card.jsx), right meta drawer (sheet.jsx) for preview and properties.",
    "upload": "Use dialog.jsx + input.jsx + drag area with hover-card.jsx. Show progress.jsx and toast on success via sonner.jsx.",
    "states": ["Empty: show textured background and CTA", "Uploading", "Virus scan pending (info)", "Failed (danger)"]
  },

  "relationship_visualization_ui": {
    "library": "D3.js force-directed network. Nodes: projects, tasks, resources; Edges: dependency, allocation, relates-to.",
    "interactions": [
      "Zoom/pan with wheel/drag",
      "Hover tooltip with metrics (task count, cost, owner)",
      "Click to focus and open right info panel",
      "Filter chips (tabs.jsx + toggle-group.jsx) by node type and status",
      "Legend using badge.jsx with colors from chart tokens",
      "Edge arrows for dependencies; dotted edge for soft relations"
    ],
    "baseline_freeze_visual": "Outline nodes with solid brand ring and lock icon when frozen; show tooltip: ‘Baseline frozen by X on date’.",
    "empty_state": "Show message + CTA to add relationships with data-testid=\"relationships-empty-create-button\""
  },

  "components": {
    "primitives_to_use": [
      "./components/ui/button.jsx",
      "./components/ui/card.jsx",
      "./components/ui/tabs.jsx",
      "./components/ui/table.jsx",
      "./components/ui/dialog.jsx",
      "./components/ui/sheet.jsx",
      "./components/ui/breadcrumb.jsx",
      "./components/ui/dropdown-menu.jsx",
      "./components/ui/input.jsx",
      "./components/ui/textarea.jsx",
      "./components/ui/select.jsx",
      "./components/ui/switch.jsx",
      "./components/ui/checkbox.jsx",
      "./components/ui/calendar.jsx",
      "./components/ui/accordion.jsx",
      "./components/ui/sonner.jsx",
      "./components/ui/progress.jsx",
      "./components/ui/tooltip.jsx",
      "./components/ui/avatar.jsx",
      "./components/ui/skeleton.jsx"
    ],
    "buttons": {
      "tone": "Professional / Corporate",
      "variants": {
        "primary": "bg-[hsl(var(--brand))] text-white hover:bg-[hsl(188_60%_30%)] focus-visible:outline-[var(--focus-ring)] shadow-[var(--btn-shadow)]",
        "secondary": "bg-[hsl(var(--accent-mist))] text-[hsl(var(--brand))] hover:bg-[hsl(188_55%_92%)] border border-[hsl(var(--border))]",
        "ghost": "hover:bg-[hsl(var(--accent-mist))] text-ink"
      },
      "sizes": {
        "sm": "h-8 px-3 rounded-[var(--btn-radius)]",
        "md": "h-10 px-4 rounded-[var(--btn-radius)]",
        "lg": "h-12 px-5 rounded-[var(--btn-radius)]"
      },
      "testid_rule": "All buttons must include data-testid='<role>-<scope>-button'"
    },
    "cards": "Use card.jsx with shadow-[var(--shadow-1)] rounded-[var(--radius-lg)] bg-white dark:bg-[hsl(var(--bg-elevated))]",
    "tables": "table.jsx + sticky header, zebra rows using even:bg-[hsl(var(--surface-muted))] dark:even:bg-[hsl(var(--surface-muted))]",
    "forms": "Use form.jsx, input.jsx, select.jsx, calendar.jsx for date ranges; always include visible labels and helper text."
  },

  "data_viz": {
    "charts": "Use Recharts for KPIs (budget vs actual, resource load). Colors from chart-1..5. Provide empty states with Skeleton and a hint.",
    "network_graph": "Use D3 v7 for relationships. Mount in a resizable container with resizable.jsx and observe ResizeObserver.",
    "legend": "badge.jsx with outline style for each type; provide data-testid on each legend item"
  },

  "micro_interactions": {
    "hover": "Buttons: color shift and subtle shadow. Cards: lift by translate-y-[1px] and shadow change. Links: underline offset-2 on hover.",
    "enter": "Use Framer Motion fade+up on cards and rows (duration 0.24s, delay 40ms stagger)",
    "scroll": "Parallax only in marketing/hero sections, not in app content.",
    "focus": "Consistent focus ring via --focus-ring token; never remove outline."
  },

  "accessibility": {
    "contrast": "WCAG AA minimum; verify brand on white passes (>= 4.5:1); use brand-contrast variable for text on brand surfaces.",
    "keyboard": "All interactive elements reachable with Tab and have visible focus.",
    "aria": "Breadcrumbs, tabs, dialogs, toasts with role attributes from shadcn primitives.",
    "reduced_motion": "Respect prefers-reduced-motion and shorten or remove transitions."
  },

  "testing_attributes": {
    "rule": "All interactive and key informational elements MUST include data-testid in kebab-case describing role.",
    "examples": [
      "data-testid=\"login-form-submit-button\"",
      "data-testid=\"project-row\"",
      "data-testid=\"task-kanban-add-card-button\"",
      "data-testid=\"baseline-freeze-toggle\"",
      "data-testid=\"resource-allocation-chart\"",
      "data-testid=\"documents-upload-input\"",
      "data-testid=\"relationships-legend-item\""
    ]
  },

  "light_dark_mode": {
    "toggle": "Use switch.jsx in user menu. Apply 'dark' class on <html> and persist preference to localStorage.",
    "surfaces": "Prefer dark solid surfaces without gradients for readability; use brand accents sparingly."
  },

  "tailwind_utility_snippets": {
    "page_wrapper": "min-h-screen bg-background text-foreground",
    "content_area": "container mx-auto px-4 sm:px-6 lg:px-8 py-6",
    "grid_dashboard": "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5",
    "bento_card_span": ["xl:col-span-3", "xl:col-span-4", "xl:col-span-5"]
  },

  "js_scaffolds": {
    "dashboard_page.js": """
      // pages/Dashboard.js
      import React from 'react'
      import { Card } from './components/ui/card'
      import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
      import { Button } from './components/ui/button'
      import { Breadcrumb, BreadcrumbList, BreadcrumbItem } from './components/ui/breadcrumb'
      import { Toaster } from './components/ui/sonner'

      export default function Dashboard() {
        return (
          <div className=\"min-h-screen bg-background\" data-testid=\"dashboard-page\"> 
            <Toaster />
            <div className=\"border-b bg-[hsl(var(--accent-mist))]\">
              <div className=\"container mx-auto px-4 sm:px-6 lg:px-8 py-3\">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>Home</BreadcrumbItem>
                    <BreadcrumbItem>Dashboard</BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            <div className=\"container mx-auto px-4 sm:px-6 lg:px-8 py-6\">
              <Tabs defaultValue=\"overview\">
                <TabsList>
                  <TabsTrigger value=\"overview\">Overview</TabsTrigger>
                  <TabsTrigger value=\"resources\">Resources</TabsTrigger>
                  <TabsTrigger value=\"costs\">Costs</TabsTrigger>
                </TabsList>

                <TabsContent value=\"overview\"> 
                  <div className=\"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5\">
                    <Card className=\"xl:col-span-5 p-5\" data-testid=\"kpi-ontrack-card\">On track</Card>
                    <Card className=\"xl:col-span-4 p-5\" data-testid=\"kpi-risk-card\">At risk</Card>
                    <Card className=\"xl:col-span-3 p-5\" data-testid=\"kpi-late-card\">Late</Card>
                    <Card className=\"xl:col-span-12 p-5\" data-testid=\"projects-table\">Projects table</Card>
                  </div>
                </TabsContent>

                <TabsContent value=\"resources\">Resources content</TabsContent>
                <TabsContent value=\"costs\">Costs content</TabsContent>
              </Tabs>
            </div>
          </div>
        )
      }
    """,

    "relationships_graph.js": """
      // components/RelationshipsGraph.js
      import React, { useEffect, useRef } from 'react'
      import * as d3 from 'd3'

      export const RelationshipsGraph = ({ data }) => {
        const ref = useRef(null)

        useEffect(() => {
          if (!data || !ref.current) return
          const el = ref.current
          const width = el.clientWidth
          const height = 520
          el.innerHTML = ''

          const svg = d3.select(el)
            .append('svg')
            .attr('width', '100%')
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('data-testid', 'relationships-graph')

          const color = (d) => ({
            project: 'hsl(188 60% 36%)',
            task: 'hsl(210 30% 45%)',
            resource: 'hsl(158 55% 40%)',
          }[d.type] || 'hsl(35 70% 48%)')

          const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-220))
            .force('center', d3.forceCenter(width / 2, height / 2))

          const link = svg.append('g')
              .attr('stroke', 'hsl(222 10% 70%)')
              .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(data.links)
            .join('line')
              .attr('stroke-dasharray', d => d.kind === 'relates' ? '4,3' : null)
              .attr('marker-end', d => d.kind === 'dependency' ? 'url(#arrow)' : null)

          const node = svg.append('g')
            .attr('stroke', '#fff').attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(data.nodes)
            .join('circle')
              .attr('r', d => d.type === 'project' ? 10 : 7)
              .attr('fill', color)
              .attr('data-testid', d => `node-${d.type}`)
              .call(drag(simulation))

          node.append('title').text(d => d.label)

          simulation.on('tick', () => {
            link
              .attr('x1', d => d.source.x)
              .attr('y1', d => d.source.y)
              .attr('x2', d => d.target.x)
              .attr('y2', d => d.target.y)
            node
              .attr('cx', d => d.x)
              .attr('cy', d => d.y)
          })

          svg.append('defs').append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 15)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
              .attr('d', 'M0,-5L10,0L0,5')
              .attr('fill', 'hsl(222 10% 70%)')

          function drag(sim) {
            function dragstarted(event, d){ if(!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y }
            function dragged(event, d){ d.fx = event.x; d.fy = event.y }
            function dragended(event, d){ if(!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null }
            return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
          }
        }, [data])

        return <div ref={ref} className=\"w-full\" data-testid=\"relationships-graph-container\" />
      }
    """
  },

  "flows_and_interactions": {
    "project_crud": "Use dialog.jsx for create/edit with multi-step collapsible sections. Confirm destructive actions in alert-dialog.jsx.",
    "task_baseline_freeze": "Switch.jsx toggles freeze (PM/Admin only). Show tooltip: ‘Freeze prevents date/scope edits’. On enable, lock icon appears on task rows and D3 nodes.",
    "resource_allocation": "Calendar.jsx for date selection, table.jsx for weekly allocation with progress.jsx indicators. Use tooltip.jsx to show utilization %.",
    "cost_tracking": "Tabs for Budget/Actual/Variance. Recharts AreaChart with chart-1..5. Export via dropdown-menu.jsx.",
    "documents": "Drag area with hover-card, preview via dialog + carousel for images."
  },

  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1646683071748-37fb1db38478?auto=format&fit=crop&w=1600&q=80",
      "description": "Light teal water texture for hero backdrop (max 20% viewport)",
      "category": "hero_background"
    },
    {
      "url": "https://images.unsplash.com/photo-1561053262-7e6b03b666fa?auto=format&fit=crop&w=1600&q=80",
      "description": "Abstract teal/sand diagonal for empty states",
      "category": "empty_state"
    },
    {
      "url": "https://images.unsplash.com/photo-1571947567273-19d41733c08b?auto=format&fit=crop&w=1600&q=80",
      "description": "Soft sand ripple texture for section dividers",
      "category": "section_texture"
    }
  ],

  "component_path": {
    "button": "./components/ui/button.jsx",
    "card": "./components/ui/card.jsx",
    "tabs": "./components/ui/tabs.jsx",
    "table": "./components/ui/table.jsx",
    "dialog": "./components/ui/dialog.jsx",
    "sheet": "./components/ui/sheet.jsx",
    "breadcrumb": "./components/ui/breadcrumb.jsx",
    "dropdown_menu": "./components/ui/dropdown-menu.jsx",
    "input": "./components/ui/input.jsx",
    "textarea": "./components/ui/textarea.jsx",
    "select": "./components/ui/select.jsx",
    "switch": "./components/ui/switch.jsx",
    "checkbox": "./components/ui/checkbox.jsx",
    "calendar": "./components/ui/calendar.jsx",
    "accordion": "./components/ui/accordion.jsx",
    "sonner_toast": "./components/ui/sonner.jsx",
    "progress": "./components/ui/progress.jsx",
    "tooltip": "./components/ui/tooltip.jsx",
    "skeleton": "./components/ui/skeleton.jsx"
  },

  "additional_libraries": {
    "framer_motion": {
      "install": "npm i framer-motion",
      "usage": "Wrap list render with motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.24}}"
    },
    "recharts": {
      "install": "npm i recharts",
      "usage": "Use AreaChart/BarChart for cost & resource charts with colors from semantic tokens"
    },
    "d3": {
      "install": "npm i d3",
      "usage": "Force-directed network in RelationshipsGraph.js with zoom/pan and arrow markers"
    },
    "lucide_react": {
      "install": "npm i lucide-react",
      "usage": "Use icons for role indicators, locks, costs. Never emoji."
    }
  },

  "instructions_to_main_agent": [
    "Add Google Fonts link to index.html and set body class to use Karla.",
    "Extend index.css with css_custom_properties block; do not remove existing variables.",
    "Build pages with default exports in .js files; build reusable UI as named exports.",
    "Wire all interactive elements with data-testid attributes per testing rule.",
    "Use shadcn/ui primitives from ./components/ui only — never raw HTML dropdowns, toasts, or calendars.",
    "Apply gradients only on hero/section wrappers and keep under 20% viewport.",
    "Implement dark mode by toggling 'dark' on html and persisting preference.",
    "For date inputs (scheduling, costs), always use calendar.jsx.",
    "For toasts, add <Toaster /> from ./components/ui/sonner.jsx at app root.",
    "Adopt spacing: section padding 24–40px; card padding 20–24px; grid gap 20px+."
  ]
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>