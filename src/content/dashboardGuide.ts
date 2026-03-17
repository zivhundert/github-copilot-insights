export interface GuideTopic {
  id: string;
  title: string;
  summary: string;
  formula?: string;
  whatItShows: string;
  whyItMatters: string;
  howToInterpret: string[];
  whatItDoesNotMean?: string[];
  actions?: string[];
  caveats?: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  description: string;
  topics: GuideTopic[];
}

export const dashboardGuideSections: GuideSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Why this dashboard exists and how to read it without over-indexing on one metric.',
    topics: [
      {
        id: 'dashboard-overview',
        title: 'How to Read This Dashboard',
        summary: 'This dashboard is designed to measure adoption, output, workflow style, and business context together.',
        whatItShows:
          'A balanced view of Copilot usage across adoption, suggestion activity, Copilot-related code output, workflow style, and business-oriented ROI assumptions.',
        whyItMatters:
          'A single metric like Acceptance Rate is useful, but incomplete. This dashboard is structured to avoid unfairly judging developers who use chat, edit, or agent workflows differently from classic completion-heavy usage.',
        howToInterpret: [
          'Start with KPIs for the broad picture, then use charts and the leaderboard to understand who is using Copilot, how they use it, and where coaching or enablement is needed.',
          'Read event-based metrics like Acceptance Rate separately from line-based metrics like AI Code Amplification and Total AI Code Added.',
          'Compare behavior patterns across suggestion-heavy, hybrid, and agent-heavy users before making conclusions about value.'
        ],
        whatItDoesNotMean: [
          'This dashboard does not directly measure code quality, business impact, or correctness of generated code.',
          'High engagement does not automatically mean high productivity.',
          'Low acceptance does not automatically mean low value.'
        ],
        actions: [
          'Use this dashboard to spot adoption gaps, Champions, workflow patterns, and coaching opportunities.',
          'Interpret metrics together, not in isolation.'
        ],
        caveats: [
          'The structure intentionally combines engagement, output, efficiency, and ROI context so agent-heavy usage is not undervalued.'
        ]
      }
    ]
  },
  {
    id: 'kpis',
    title: 'Core KPIs',
    description: 'Plain-language definitions, formulas, and caveats for the top-line metrics.',
    topics: [
      {
        id: 'kpi-total-ai-code-added',
        title: 'Total AI Code Added',
        summary: 'Measures how many lines were added to the editor through Copilot-related workflows.',
        formula: 'SUM(loc_added_sum)',
        whatItShows:
          'Total Copilot-related code added to the editor, including accepted completions, applied code blocks, and agent/edit output.',
        whyItMatters:
          'This is the broadest output metric in the dashboard and captures value beyond classic suggestion acceptance.',
        howToInterpret: [
          'Higher values usually indicate greater Copilot-assisted code output.',
          'Strong values with moderate acceptance may still reflect successful agent or edit workflows.',
          'Use alongside Interactions and Efficiency to see whether output is coming from heavy prompting or efficient usage.'
        ],
        whatItDoesNotMean: [
          'It is not the same thing as accepted suggestion lines.',
          'It does not prove the code was high quality or retained long term.'
        ],
        actions: [
          'Use it to identify power users and high-output workflows.',
          'Compare with Suggested Code and AI Amplification to understand workflow style.'
        ]
      },
      {
        id: 'kpi-acceptance-rate',
        title: 'Acceptance Rate',
        summary: 'An event-based trust and relevance metric for generated suggestions.',
        formula: '(SUM(code_acceptance_activity_count) / SUM(code_generation_activity_count)) × 100',
        whatItShows:
          'The percentage of generated suggestions that developers actively accepted.',
        whyItMatters:
          'It is useful for understanding suggestion-based workflows and whether completions are being used.',
        howToInterpret: [
          'Higher values usually indicate suggestions are relevant and trusted in completion-heavy workflows.',
          'Typical ranges depend on context, language, and working style, so use trends and comparisons carefully.',
          'Interpret low values carefully when users are agent-heavy or when generation counts are low.'
        ],
        whatItDoesNotMean: [
          'It does not measure all Copilot value.',
          'It does not capture applied code blocks, agent output, or edits that bypass classic suggestion acceptance flows.'
        ],
        caveats: [
          'This metric is event-based only and can underrepresent agent-heavy workflows.'
        ],
        actions: [
          'Use it to evaluate suggestion relevance, not total value.',
          'Pair it with AI Code Added and AI Code Amplification before judging user performance.'
        ]
      },
      {
        id: 'kpi-ai-amplification',
        title: 'AI Code Amplification',
        summary: 'A line-based output ratio that can reveal chat, edit, and agent-heavy behavior.',
        formula: '(SUM(loc_added_sum) / SUM(loc_suggested_to_add_sum)) × 100',
        whatItShows:
          'The ratio of Copilot-related code added versus code suggested.',
        whyItMatters:
          'It helps distinguish classic suggestion usage from workflows where users turn suggestions, chat, or agents into larger code output.',
        howToInterpret: [
          'Values above 100% can happen when chat, edit, or agent workflows add more code than was directly suggested as inline completions.',
          'High values often indicate strong output from agent/edit usage rather than better acceptance.',
          'Use alongside Acceptance Rate to separate event-based trust from line-based output.'
        ],
        whatItDoesNotMean: [
          'It is not acceptance rate.',
          'It is not a quality score.'
        ],
        caveats: [
          'This metric can exceed 100%.',
          'Line-based ratios are not interchangeable with event-based acceptance.'
        ],
        actions: [
          'Use it to identify agent-heavy or edit-heavy users whose value may be missed by Acceptance Rate alone.'
        ]
      },
      {
        id: 'kpi-suggested-code',
        title: 'Suggested Code',
        summary: 'Tracks how much code Copilot suggested to add.',
        formula: 'SUM(loc_suggested_to_add_sum)',
        whatItShows:
          'The amount of code Copilot suggested, mainly reflecting suggestion and ghost-text style workflows.',
        whyItMatters:
          'It provides context for Acceptance Rate and AI Code Amplification.',
        howToInterpret: [
          'Higher values usually indicate heavier suggestion generation activity.',
          'High Suggested Code with low Added Code may signal low acceptance, low usefulness, or experimentation without much retained output.',
          'Lower values do not necessarily mean low Copilot value if users rely more on agent or edit workflows.'
        ],
        whatItDoesNotMean: [
          'It does not tell you how much code was actually accepted or added.'
        ],
        actions: [
          'Use it as context when diagnosing completion-heavy versus agent-heavy behavior.'
        ]
      },
      {
        id: 'kpi-interactions',
        title: 'Interactions',
        summary: 'Measures prompt and engagement activity, not value by itself.',
        formula: 'SUM(user_initiated_interaction_count)',
        whatItShows:
          'How often users actively interacted with Copilot.',
        whyItMatters:
          'It helps show adoption, experimentation, and effort level.',
        howToInterpret: [
          'Higher values may indicate strong engagement, complex tasks, or friction requiring more prompting.',
          'Lower values paired with strong output can indicate efficient or agent-driven workflows.',
          'Compare with AI Code Added and Efficiency to judge whether interaction volume is productive.'
        ],
        whatItDoesNotMean: [
          'More interactions do not automatically mean more value or better usage.'
        ],
        actions: [
          'Use it to spot heavily engaged users and users who may need coaching if output stays low.'
        ]
      },
      {
        id: 'kpi-efficiency',
        title: 'Efficiency / AI Output per Interaction',
        summary: 'A practical output-per-effort metric used prominently in the leaderboard.',
        formula: 'SUM(loc_added_sum) / SUM(user_initiated_interaction_count)',
        whatItShows:
          'How much Copilot-related code output is produced per user interaction.',
        whyItMatters:
          'It helps separate high-activity users from users who translate prompting into efficient output.',
        howToInterpret: [
          'Higher values suggest more output per interaction.',
          'Low values can mean experimentation, friction, or complex problem solving that takes many prompts.',
          'Interpret with context; low efficiency can still be valuable in research or debugging-heavy workflows.'
        ],
        whatItDoesNotMean: [
          'It is not a direct measure of quality or correctness.'
        ],
        actions: [
          'Use it to identify users who may benefit from workflow coaching or prompt-pattern sharing.'
        ]
      },
      {
        id: 'kpi-time-saved',
        title: 'Development Time Saved',
        summary: 'An estimate based on your configured coding-speed assumption.',
        formula: 'ROUND(SUM(loc_added_sum) / (linesPerMinute × 60))',
        whatItShows:
          'Estimated developer hours saved based on total AI Code Added and your configured lines-per-minute assumption.',
        whyItMatters:
          'It translates output into a business-friendly estimate that leaders can understand quickly.',
        howToInterpret: [
          'Treat it as a planning estimate, not a measured stopwatch result.',
          'Adjust settings to align the calculation with your team’s real-world coding speed.',
          'Compare changes over time to understand directionally whether Copilot value is increasing.'
        ],
        whatItDoesNotMean: [
          'It does not prove exact time saved for each developer or task.'
        ],
        actions: [
          'Use it for rough business communication and ROI conversations.'
        ]
      },
      {
        id: 'kpi-cost-savings',
        title: 'Development Cost Savings',
        summary: 'Converts estimated time savings into monetary value using your hourly-rate assumption.',
        formula: 'Estimated Hours Saved × pricePerHour',
        whatItShows:
          'Estimated development cost avoided because AI-assisted output reduced manual effort.',
        whyItMatters:
          'It helps connect engineering activity to financial language for stakeholders.',
        howToInterpret: [
          'The number is only as strong as your configured hourly-rate assumption.',
          'Use it directionally and consistently rather than treating it as audited financial truth.'
        ],
        whatItDoesNotMean: [
          'It is not booked savings in the accounting sense.'
        ],
        actions: [
          'Use it to communicate business context and justify enablement investment.'
        ]
      },
      {
        id: 'kpi-roi',
        title: 'ROI - Copilot Investment Return',
        summary: 'A business-context metric based on estimated savings versus Copilot license cost.',
        formula: '(Estimated Money Saved / (Active Users × copilotPricePerUser × 12)) × 100',
        whatItShows:
          'Estimated return on investment using modeled savings divided by annual Copilot license spend.',
        whyItMatters:
          'It creates a simple executive-friendly lens for whether the adoption program appears financially justified.',
        howToInterpret: [
          'Use it as a directional business metric grounded in assumptions, not as a direct developer quality score.',
          'Large swings can come from assumptions, active-user counts, or unusually high output periods.',
          'Compare ROI with adoption depth so you do not mistake a small group of power users for broad team success.'
        ],
        whatItDoesNotMean: [
          'It does not directly measure software quality, delivery outcomes, or long-term maintainability.'
        ],
        caveats: [
          'ROI depends on lines-per-minute, hourly-rate, and license-cost settings.'
        ],
        actions: [
          'Use it for leadership discussions, budgeting, and adoption program reviews.'
        ]
      },
      {
        id: 'kpi-active-users',
        title: 'Active Users',
        summary: 'Counts the distinct users represented in the filtered dataset.',
        formula: 'COUNT(DISTINCT user_login)',
        whatItShows:
          'The number of unique users active in the selected dataset.',
        whyItMatters:
          'It provides adoption breadth, context for ROI, and a denominator for coaching or enablement decisions.',
        howToInterpret: [
          'Higher counts suggest broader adoption, but not necessarily deeper usage.',
          'Track it with Interactions and output metrics to see whether adoption is shallow or meaningful.'
        ],
        whatItDoesNotMean: [
          'It does not tell you whether users are active enough to be getting value.'
        ],
        actions: [
          'Use it to find adoption gaps and compare coverage across time periods.'
        ]
      }
    ]
  },
  {
    id: 'segments-modes',
    title: 'Segments and Usage Modes',
    description: 'How the leaderboard groups users fairly and why agent-heavy workflows should not be penalized.',
    topics: [
      {
        id: 'segmentation-model',
        title: 'Performance Segmentation Model',
        summary: 'Segments are driven mainly by adoption and impact, with acceptance as a secondary signal.',
        whatItShows:
          'The Adoption Champions leaderboard groups users into Champion, Producer, Explorer, and Starter segments based primarily on Adoption Score and Impact Score.',
        whyItMatters:
          'This avoids unfairly rewarding only classic suggestion-heavy workflows and better reflects value from chat, edit, and agent usage.',
        howToInterpret: [
          'Champion: Adoption Score ≥ 70 and Impact Score ≥ 70.',
          'Producer: Adoption Score ≥ 50 and Impact Score ≥ 40.',
          'Explorer: Adoption Score ≥ 20 and below higher thresholds.',
          'Starter: Adoption Score < 20.',
          'Adoption Score is a normalized log score of Interactions + Code Generations, while Impact Score is a normalized log score of AI Code Added.',
          'Efficiency is shown as a supporting signal, not the primary segment rule.'
        ],
        whatItDoesNotMean: [
          'Champion status does not require the highest Acceptance Rate.',
          'Starter does not always mean a weak developer; it can reflect limited usage or short observation windows.'
        ],
        actions: [
          'Use segments to identify Champions to learn from, Producers to scale, Explorers to coach, and Starters to onboard.'
        ],
        caveats: [
          'Acceptance remains valuable, but it is intentionally secondary so agent-heavy users are not penalized.'
        ]
      },
      {
        id: 'usage-modes',
        title: 'Chat-heavy, Hybrid, and Agent-heavy Usage',
        summary: 'Different workflow styles surface differently in the data.',
        whatItShows:
          'The dashboard helps distinguish suggestion-heavy, mixed, and agent-heavy behavior using interactions, generations, added lines, and feature patterns.',
        whyItMatters:
          'Users can appear very different in the metrics depending on how they work with Copilot.',
        howToInterpret: [
          'Chat-heavy users often generate more classic suggestion metrics and clearer Acceptance Rate signals.',
          'Hybrid users combine suggestion workflows with broader chat or edit patterns.',
          'Agent-heavy users can produce strong AI Code Added and AI Amplification with lower classic acceptance or fewer generations.',
          'A user with moderate acceptance but high added-code output may still be a strong Copilot user.'
        ],
        whatItDoesNotMean: [
          'There is no single best mode for every developer or task.'
        ],
        actions: [
          'Use mode differences to tailor coaching, rather than pushing every developer toward one workflow style.'
        ]
      }
    ]
  },
  {
    id: 'charts',
    title: 'Charts and Sections',
    description: 'How to interpret each dashboard section, what to avoid, and what actions to take.',
    topics: [
      {
        id: 'section-adoption-insights',
        title: 'Adoption Insights',
        summary: 'Highlights underused modes and features so enablement efforts can be targeted.',
        whatItShows:
          'Recommendations for modes or features with comparatively low adoption across the team.',
        whyItMatters:
          'It quickly surfaces where training or awareness work may unlock more value.',
        howToInterpret: [
          'Low adoption percentages point to unused capability, not failure.',
          'Use it to decide where enablement content, demos, or onboarding should focus next.'
        ],
        whatItDoesNotMean: [
          'A low-adoption feature is not automatically low-value for the team.'
        ],
        actions: [
          'Run targeted education for low-adoption features like Agent, Chat, or CLI.'
        ]
      },
      {
        id: 'section-user-profile',
        title: 'User Profile Card',
        summary: 'Summarizes one selected user’s preferred tools, usage pattern, and activity context.',
        whatItShows:
          'Preferred model, preferred IDE, top languages, Acceptance Rate, total Interactions, used features, and active days for a single selected user.',
        whyItMatters:
          'It helps managers or developers understand an individual workflow at a glance before looking deeper into charts.',
        howToInterpret: [
          'Use it as context, not as a standalone performance score.',
          'Combine it with leaderboard signals and chart trends to understand the person’s working style.'
        ],
        whatItDoesNotMean: [
          'It is not a complete performance review.'
        ],
        actions: [
          'Use it for coaching conversations and workflow comparisons.'
        ]
      },
      {
        id: 'chart-cumulative-growth',
        title: 'AI Code Generation Growth',
        summary: 'Shows cumulative Copilot-related code output over time.',
        whatItShows:
          'A running total of AI-assisted code growth across the selected period.',
        whyItMatters:
          'It reveals whether adoption and output are compounding over time.',
        howToInterpret: [
          'A steeper slope means output is accumulating faster.',
          'Plateaus can indicate low activity, filters that narrow the scope, or slower adoption periods.'
        ],
        whatItDoesNotMean: [
          'It does not show whether the added code came from suggestion acceptance versus agent/edit workflows.'
        ],
        actions: [
          'Use it to compare periods before and after enablement or policy changes.'
        ]
      },
      {
        id: 'chart-acceptance-rate-trend',
        title: 'Acceptance Rate Trend',
        summary: 'Tracks how event-based suggestion acceptance changes over time.',
        whatItShows:
          'Acceptance Rate by period using Code Acceptances divided by Code Generations.',
        whyItMatters:
          'It reveals whether suggestion relevance or trust is improving in completion-heavy usage.',
        howToInterpret: [
          'Upward trends can indicate better usage patterns, model fit, or task alignment.',
          'Downward trends may reflect task complexity, behavior changes, or a shift toward agent-heavy workflows.'
        ],
        whatItDoesNotMean: [
          'A lower trend does not automatically mean Copilot is delivering less value overall.'
        ],
        actions: [
          'Use it to monitor completion relevance, but pair it with line-based output metrics.'
        ]
      },
      {
        id: 'chart-model-usage',
        title: 'AI Model Usage',
        summary: 'Shows which models are being used across Copilot interactions.',
        whatItShows:
          'Relative interaction volume by model.',
        whyItMatters:
          'It helps identify team preferences, rollout effects, and concentration on particular model families.',
        howToInterpret: [
          'A dominant model may indicate default tooling, stronger trust, or better task fit.',
          'Model share alone does not tell you whether that model drives better outcomes.'
        ],
        whatItDoesNotMean: [
          'Most-used does not automatically mean most-effective.'
        ],
        actions: [
          'Compare this chart with Model Effectiveness before standardizing on one model.'
        ]
      },
      {
        id: 'chart-feature-usage',
        title: 'Feature Usage Breakdown',
        summary: 'Shows where users spend activity across Copilot features.',
        whatItShows:
          'Usage split across features such as Code Completion, Agent Mode, Ask Mode, Agent Edit, and Custom Mode.',
        whyItMatters:
          'It helps you understand workflow mix and whether the team is exploring higher-value modes beyond completion.',
        howToInterpret: [
          'Strong Code Completion usage suggests classic suggestion-driven behavior.',
          'Rising Agent Mode or Agent Edit usage can indicate deeper workflow maturity.'
        ],
        whatItDoesNotMean: [
          'A feature with lower usage is not necessarily less valuable.'
        ],
        actions: [
          'Use it to plan training on underused but strategic features.'
        ]
      },
      {
        id: 'chart-model-effectiveness',
        title: 'Model Effectiveness Comparison',
        summary: 'Compares output-related signals across models, not just popularity.',
        whatItShows:
          'Relative effectiveness indicators by model based on the dashboard’s available activity and output metrics.',
        whyItMatters:
          'It helps teams avoid optimizing only for usage share when outcome signals differ by model.',
        howToInterpret: [
          'Look for models that combine meaningful usage with strong output or acceptance signals.',
          'Be careful with small-sample models, where a few users can distort the picture.'
        ],
        whatItDoesNotMean: [
          'It is not a controlled benchmark of model quality.'
        ],
        actions: [
          'Use it to inform experimentation, not to declare a universal winner.'
        ]
      },
      {
        id: 'chart-code-churn',
        title: 'Code Churn',
        summary: 'Shows how much Copilot-related code is added versus deleted.',
        whatItShows:
          'Patterns of AI-assisted code addition and deletion over time.',
        whyItMatters:
          'It can reveal revision-heavy behavior, experimentation, or unstable output.',
        howToInterpret: [
          'Higher deletion alongside high addition may reflect experimentation, refactoring, or iterative agent workflows.',
          'Low churn can mean stable output, but context matters.'
        ],
        whatItDoesNotMean: [
          'High churn is not always bad; it can be healthy iteration.'
        ],
        actions: [
          'Use it to spot teams or periods where outputs may need review, coaching, or different workflow guidance.'
        ]
      },
      {
        id: 'chart-interactions-per-developer',
        title: 'Interactions per Developer',
        summary: 'Shows average engagement intensity per user over time.',
        whatItShows:
          'Average user-initiated interactions per developer for each period.',
        whyItMatters:
          'It shows whether Copilot usage is deepening or whether users are only touching it lightly.',
        howToInterpret: [
          'Rising values can mean growing engagement, but may also reflect more prompting to complete complex tasks.',
          'Falling values can mean declining adoption or increasing efficiency.'
        ],
        whatItDoesNotMean: [
          'More interactions alone do not equal more success.'
        ],
        actions: [
          'Cross-check with output metrics to distinguish productive engagement from friction.'
        ]
      },
      {
        id: 'chart-ide-distribution',
        title: 'IDE Distribution',
        summary: 'Shows where Copilot usage is concentrated across IDEs.',
        whatItShows:
          'The split of Copilot activity across development environments such as VS Code and JetBrains IDEs.',
        whyItMatters:
          'It helps prioritize enablement, plugin support, and rollout strategy by environment.',
        howToInterpret: [
          'A dominant IDE often reflects team standardization or better plugin familiarity.',
          'Fragmented IDE usage may require broader enablement coverage.'
        ],
        whatItDoesNotMean: [
          'IDE share alone does not tell you which environment is delivering the best outcomes.'
        ],
        actions: [
          'Use it to focus documentation, plugin support, and training where usage is highest.'
        ]
      },
      {
        id: 'chart-programming-language-usage',
        title: 'Programming Language Usage',
        summary: 'Shows where Copilot activity is concentrated across languages.',
        whatItShows:
          'Relative Copilot usage by programming language.',
        whyItMatters:
          'It helps explain where acceptance, output, and workflow patterns may differ due to language context.',
        howToInterpret: [
          'Larger language segments indicate more Copilot activity in that language.',
          'Do not compare languages as if they have the same task shapes or completion patterns.'
        ],
        whatItDoesNotMean: [
          'A large language segment does not automatically mean Copilot works better there.'
        ],
        actions: [
          'Use it to target language-specific best practices and enablement.'
        ]
      },
      {
        id: 'chart-agent-adoption',
        title: 'Agent / Chat / CLI Users',
        summary: 'Shows how many users are using higher-level Copilot modes over time.',
        whatItShows:
          'Adoption of Agent, Chat, and CLI usage patterns.',
        whyItMatters:
          'It helps teams understand whether they are moving beyond classic completion usage into broader AI workflows.',
        howToInterpret: [
          'Growth in Agent or CLI usage can signal workflow maturity and deeper operational adoption.',
          'Flat adoption may indicate missing awareness, permissions, or habit change.'
        ],
        whatItDoesNotMean: [
          'Higher counts do not automatically guarantee higher output or value.'
        ],
        actions: [
          'Use it to measure enablement program reach for advanced Copilot modes.'
        ]
      },
      {
        id: 'chart-language-feature-matrix',
        title: 'Language × Feature Matrix',
        summary: 'Reveals how different languages and Copilot features intersect.',
        whatItShows:
          'Cross-usage between languages and feature types.',
        whyItMatters:
          'It helps uncover whether certain features are being adopted only in specific language contexts.',
        howToInterpret: [
          'Look for concentration patterns that may indicate strong task fit or training gaps.',
          'Sparse cells may reveal opportunities, not just lack of value.'
        ],
        whatItDoesNotMean: [
          'A sparse matrix cell does not prove the feature is ineffective for that language.'
        ],
        actions: [
          'Use it to design language-specific enablement campaigns.'
        ]
      },
      {
        id: 'chart-engagement-heatmap',
        title: 'Engagement Heatmap',
        summary: 'Provides a calendar-style view of interaction intensity across days.',
        whatItShows:
          'Daily activity intensity, with darker cells indicating higher interaction volume.',
        whyItMatters:
          'It helps spot rhythm, seasonality, bursts of experimentation, or periods of quiet adoption.',
        howToInterpret: [
          'Clusters of darker days usually indicate concentrated activity periods.',
          'Lighter periods may reflect holidays, delivery cycles, or reduced usage.'
        ],
        whatItDoesNotMean: [
          'It does not explain why activity changed.'
        ],
        actions: [
          'Use it to correlate adoption shifts with launches, training, or team events.'
        ]
      },
      {
        id: 'chart-day-of-week',
        title: 'Activity by Day of Week',
        summary: 'Shows which weekdays concentrate the most Copilot activity.',
        whatItShows:
          'Average or total activity by weekday.',
        whyItMatters:
          'It can reveal habit patterns, sprint rhythms, and the best timing for enablement interventions.',
        howToInterpret: [
          'Peaks can reflect sprint routines, pairing schedules, or focused coding windows.',
          'Lower days are not inherently problematic.'
        ],
        whatItDoesNotMean: [
          'It is not a productivity ranking of weekdays.'
        ],
        actions: [
          'Schedule training and office hours on days when engagement is naturally high.'
        ]
      },
      {
        id: 'chart-ide-version',
        title: 'IDE & Plugin Version Distribution',
        summary: 'Shows the versions of IDEs and plugins in use across the team.',
        whatItShows:
          'Distribution of IDE and Copilot plugin versions over time.',
        whyItMatters:
          'It helps identify outdated tooling that may reduce feature availability or user experience quality.',
        howToInterpret: [
          'Version fragmentation can signal rollout inconsistency or support complexity.',
          'Older plugin versions may explain feature adoption gaps.'
        ],
        whatItDoesNotMean: [
          'Version data alone does not prove causality for poor outcomes.'
        ],
        actions: [
          'Use it to drive plugin upgrades and standardize baseline tooling.'
        ]
      }
    ]
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard and Responsible Interpretation',
    description: 'How to read the Adoption Champions table, all visible columns, and the caveats that matter most.',
    topics: [
      {
        id: 'leaderboard-guide',
        title: 'Adoption Champions Leaderboard',
        summary: 'The leaderboard is built to highlight balanced adoption and impact, not just suggestion acceptance.',
        whatItShows:
          'A per-user view of performance segment, output, engagement, efficiency, acceptance, suggestion volume, churn, and user-level ROI.',
        whyItMatters:
          'It helps identify Champions to learn from, users who are scaling, users exploring, and users who may need onboarding or coaching.',
        howToInterpret: [
          'Performance is the assigned segment: 🚀 Champion, ✨ Producer, 📈 Explorer, or 🌱 Starter.',
          'AI Code Added is a primary impact signal based on total Copilot-related lines added.',
          'Interactions measure prompting and engagement, not value by themselves.',
          'Adoption Score and Impact Score are the primary ranking signals behind segmentation.',
          'Efficiency is Added Code / Interactions and acts as a strong secondary signal.',
          'Acceptance Rate is event-based and useful, but secondary to segment logic.',
          'Suggested Code reflects inline suggestion volume, while AI Amplification compares added lines to suggested lines.',
          'Code Generations and Code Acceptances explain the event basis of Acceptance Rate.',
          'Lines Deleted adds churn context.',
          'User ROI estimates savings versus per-user license cost and should be read as business context only.'
        ],
        whatItDoesNotMean: [
          'A lower-ranked user is not necessarily underperforming overall as an engineer.',
          'A user with lower acceptance can still be highly valuable if they are agent-heavy and generate strong added-code output.'
        ],
        actions: [
          'Use the table to identify Champions to study, Producers to scale, Explorers to coach, and Starters to onboard.',
          'Sort by different columns to separate engagement, output, and workflow style.'
        ],
        caveats: [
          'Primary ranking is anchored in adoption and impact, not acceptance alone.',
          'Low-confidence Acceptance Rate should be treated cautiously when Code Generations are low.'
        ]
      },
      {
        id: 'metric-caveats',
        title: 'How to Interpret This Responsibly',
        summary: 'The most important rules for avoiding incorrect conclusions.',
        whatItShows:
          'Common pitfalls when reading dashboard metrics and how to avoid them.',
        whyItMatters:
          'Without caveats, managers can overread one metric and misjudge both adoption and value.',
        howToInterpret: [
          'Line-based ratios are not the same as Acceptance Rate.',
          'AI Code Amplification can exceed 100% and that is expected in agent/edit-heavy workflows.',
          'Low Acceptance Rate does not automatically mean low value.',
          'Interactions alone do not equal success.',
          'Agent-heavy workflows behave differently from classic suggestion workflows.',
          'Low sample sizes can distort rate-based metrics.'
        ],
        whatItDoesNotMean: [
          'This dashboard should not be used as a one-number ranking of developer quality.'
        ],
        actions: [
          'Always compare at least one engagement metric, one output metric, and one caveat-aware metric before making a decision.'
        ]
      },
      {
        id: 'how-to-use-dashboard',
        title: 'How to Use This Dashboard',
        summary: 'Action-oriented examples for different stakeholders.',
        whatItShows:
          'Role-specific ways to use the dashboard for decisions and coaching.',
        whyItMatters:
          'Different stakeholders need different questions answered from the same dataset.',
        howToInterpret: [
          'Engineering managers: identify low-adoption users, strong Champions, and whether ROI seems concentrated or broad-based.',
          'Team leads: identify users experimenting heavily with low output, high-potential Producers, and people who may need workflow coaching.',
          'Enablement / adoption owners: find underused features, low advanced-mode adoption, and language-specific enablement gaps.',
          'Individual developers: compare your own workflow style, output, and efficiency without fixating on one metric.'
        ],
        actions: [
          'Use segments for coaching priority, feature charts for training plans, and KPIs for leadership communication.'
        ]
      },
      {
        id: 'glossary',
        title: 'Glossary',
        summary: 'Quick definitions for repeated dashboard terms.',
        whatItShows:
          'Plain-language meanings for terms repeated across the dashboard.',
        whyItMatters:
          'A shared vocabulary reduces misinterpretation.',
        howToInterpret: [
          'Acceptance: an event where a generated suggestion was actively accepted.',
          'Generation: an event where Copilot produced a suggestion.',
          'AI Code Added: Copilot-related code added to the editor across all supported workflows.',
          'Suggested Code: Copilot-proposed lines to add.',
          'Interactions: user-initiated prompts or actions with Copilot.',
          'AI Amplification: added lines divided by suggested lines.',
          'Adoption Score: normalized combined engagement score used in segmentation.',
          'Impact Score: normalized output score used in segmentation.'
        ]
      }
    ]
  }
];

export const guideTopicTitleMap = Object.fromEntries(
  dashboardGuideSections.flatMap((section) => section.topics.map((topic) => [topic.id, topic.title]))
);

export const dashboardGuideTopicIdsByTitle: Record<string, string> = {
  'Total AI Code Added': 'kpi-total-ai-code-added',
  'Acceptance Rate': 'kpi-acceptance-rate',
  'AI Code Amplification': 'kpi-ai-amplification',
  'Development Time Saved (Hours)': 'kpi-time-saved',
  'Development Cost Savings': 'kpi-cost-savings',
  'ROI - Copilot Investment Return': 'kpi-roi',
  'Active Users': 'kpi-active-users',
  'Adoption Insights': 'section-adoption-insights',
  'User Profile': 'section-user-profile',
  'AI Code Generation Growth': 'chart-cumulative-growth',
  'Acceptance Rate Trend': 'chart-acceptance-rate-trend',
  'AI Model Usage': 'chart-model-usage',
  'Feature Usage Breakdown': 'chart-feature-usage',
  'Model Effectiveness Comparison': 'chart-model-effectiveness',
  'Code Churn': 'chart-code-churn',
  'Interactions per Developer': 'chart-interactions-per-developer',
  'IDE Distribution': 'chart-ide-distribution',
  'Programming Language Usage': 'chart-programming-language-usage',
  'Agent/Chat/CLI Users': 'chart-agent-adoption',
  'Language × Feature Matrix': 'chart-language-feature-matrix',
  'Engagement Heatmap': 'chart-engagement-heatmap',
  'Activity by Day of Week': 'chart-day-of-week',
  'IDE & Plugin Version Distribution': 'chart-ide-version',
  'Adoption Champions': 'leaderboard-guide'
};

export const getGuideTopicIdFromTitle = (title: string) => {
  const normalized = title
    .replace(/\s*\([^)]*\)$/g, '')
    .trim();

  return dashboardGuideTopicIdsByTitle[title] || dashboardGuideTopicIdsByTitle[normalized];
};
