import React, { useState } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';

const TutorialSection: React.FC<{ title: string; icon: React.ComponentProps<typeof Icon>['name']; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
            <Icon name={icon} className="w-8 h-8 text-brand-primary mr-4" />
            <h2 className="text-2xl font-bold text-brand-text">{title}</h2>
        </div>
        <div className="space-y-4 text-brand-text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);


const PromptToggle: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { showToast } = useToast();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const textToCopy = String(children);
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Prompt copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy prompt:", err);
            showToast("Failed to copy prompt.");
        });
    };
  
    return (
      <div className="border border-brand-bg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-3 text-left bg-brand-bg/30">
          <span className="font-semibold text-brand-text">{title}</span>
          <div className="flex items-center gap-2">
             <button 
              onClick={handleCopy} 
              className="text-brand-text-secondary hover:text-brand-text transition-colors p-1.5 rounded-full hover:bg-brand-bg/50"
              aria-label="Copy prompt"
              title="Copy prompt"
            >
              <Icon name="copy" className="w-4 h-4" />
            </button>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-text-secondary hover:text-brand-text transition-colors p-1.5 rounded-full hover:bg-brand-bg/50"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Collapse prompt' : 'Expand prompt'}
            >
              <Icon name="chevron-down" className={`w-5 h-5 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="p-3 border-t border-brand-bg">
            <pre className="bg-brand-bg/50 p-3 rounded-md text-xs whitespace-pre-wrap font-mono overflow-x-auto text-brand-text-secondary">
              <code>
                {children}
              </code>
            </pre>
          </div>
        )}
      </div>
    );
};

const prompt1 = `Analyze the following military scenario and extract the entire intent + database in a standard format:

# OVERALL GUIDELINE FOR EXTRACTION:

Your task is not just to find keywords, but to understand and interpret the script. For every field below, adhere to these principles:
1.  **BE DESCRIPTIVE:** Instead of just extracting a name (e.g., "Tomahawk missile"), briefly explain its role or significance in the context of the script (e.g., "Tomahawk cruise missiles used for the initial long-range strike against coastal defenses").
2.  **ANALYZE & INFER:** For sections like "Core Message" or "Propaganda/Bias Elements," you must analyze the text and state your conclusion clearly. Do not leave it blank if it's not explicitly stated.
3.  **QUANTIFY EVERYTHING:** Always extract specific numbers, dates, times, and costs whenever they appear. This data is critical.

Please rearrange the following information structure:

# PART A: STORY STRUCTURE & NARRATIVE ANALYSIS

## BASIC CONCEPT EXTRACTED:
- **Title Hook**: [Extract exact shock numbers from opening]
- **Core Message**: [Identify main theme - tech superiority, asymmetric warfare, etc.]
- **Conflict Type**: [Classify: surprise attack, defensive battle, overwhelming response]
- **Primary Domain**: [Naval, Ground, Air, Combined]

## NARRATIVE BREAKDOWN:
### Opening Hook (Minutes 0-2):
- **Scene described**: [Summarize opening scenario]
- **Shock numbers**: [Extract specific figures used for impact]
- **Stakes established**: [What was at risk]

### Background Context (Minutes 2-5):
- **Conflict trigger**: [What caused this confrontation]
- **Previous events**: [Any backstory mentioned]
- **Force introductions**: [How sides were presented]

### Phase 1 Analysis (Minutes 5-9):
- **Attack method**: [How initial strike was conducted]
- **Immediate casualties**: [First losses described]
- **Reaction timing**: [How quickly defense responded]

### Phase 2 Analysis (Minutes 9-15):
- **Escalation factors**: [What ramped up the conflict]
- **Technology deployment**: [Key weapons systems activated]
- **Turning point**: [Moment when tide shifted]

### Phase 3 Analysis (Minutes 15-18):
- **Decisive action**: [Final crushing blow details]
- **Destruction scale**: [Extent of damage inflicted]
- **Victory completeness**: [How total the defeat was]

### Conclusion Analysis (Minutes 18-20):
- **Lessons stated**: [What strategic points were made]
- **Global message**: [Deterrent effect claimed]
- **Audience engagement**: [How CTA was delivered]

# PART B: EXTRACTED TECHNICAL DATABASE

## BASIC INFORMATION:
- **Date**: [Extract exact date mentioned]
- **Location**: [Geographic details + coordinates if given]
- **Attacking side**: [Country + unit designations]
- **Defending side**: [Forces involved + commanders named]
- **Duration**: [Exact timeline from text]
- **Weather/Environment**: [Any conditions mentioned]

## FORCE COMPOSITION EXTRACTED:

### ATTACKING FORCE SPECS:
- **Personnel**: [Extract all numbers mentioned]
- **Main Equipment**:
  - Tanks: [Types, quantities, specifications mentioned]
  - Aircraft: [Models, loadouts, performance data]
  - Ships: [Classes, weapons systems, capabilities]
  - Missiles: [Designations, ranges, warhead types]
  - Drones: [Models, specs, operational details]

### DEFENDING FORCE SPECS:
- **Defense Systems**:
  - Air Defense: [SAM systems, radars, coverage areas]
  - Naval Defense: [Ship types, missile systems]
  - Ground Defense: [Armor, anti-tank, artillery]
  - Electronic Warfare: [Jamming, countermeasures]

## TECHNICAL SPECIFICATIONS FOUND:
### Weapons Performance Data:
- **Speeds**: [All Mach numbers, km/h figures mentioned]
- **Ranges**: [Engagement distances, missile reach]
- **Accuracy**: [CEP, hit probabilities stated]
- **Warhead Types**: [Explosive weights, penetration data]

### Economic Data Extracted:
- **Unit Costs**: [Dollar figures for equipment]
- **Total Damage**: [Billions in losses claimed]
- **Operational Costs**: [Mission expenses mentioned]

## TIMELINE RECONSTRUCTION:
### Minute-by-Minute Breakdown:
- **H-Hour**: [First shots, initial contact]
- **H+[X] minutes**: [Key escalation points]
- **H+[Y] minutes**: [Turning point moment]
- **H+[Z] minutes**: [Final resolution]

## CASUALTY & DAMAGE ASSESSMENT:
### Human Losses:
- **Attacking side**: [KIA, WIA, MIA numbers]
- **Defending side**: [Personnel casualties]
- **Civilian impact**: [Any collateral damage]

### Equipment Losses:
- **Destroyed**: [Specific platforms lost]
- **Damaged**: [Equipment degraded]
- **Captured**: [Assets seized]

## STRATEGIC ELEMENTS IDENTIFIED:
### Geographic Factors:
- **Terrain advantages**: [How geography affected battle]
- **Logistical factors**: [Supply line considerations]
- **Environmental conditions**: [Weather, visibility]

### Technology Factors:
- **Key innovations**: [Game-changing systems]
- **System integration**: [How platforms worked together]
- **Electronic warfare**: [Jamming, cyber elements]

### Tactical Innovations:
- **Novel approaches**: [New tactics employed]
- **Doctrine implications**: [How this changes thinking]
- **Lessons learned**: [Strategic takeaways]

# PART C: NARRATIVE TECHNIQUES ANALYSIS

## ENGAGEMENT METHODS USED:
- **Hook placement**: [Where shock value was inserted]
- **CTA timing**: [When subscribe/like was requested]
- **Question usage**: [Interactive elements deployed]
- **Emotional beats**: [Human interest moments]

## WRITING STYLE ELEMENTS:
- **Sentence structure**: [Short/dramatic patterns]
- **Technical integration**: [How specs were woven in]
- **Pacing techniques**: [Tension building methods]
- **Credibility markers**: [Authority establishing elements]

## PROPAGANDA/BIAS ELEMENTS:
- **Narrative slant**: [Which side favored, how obviously]
- **Omitted information**: [What wasn't discussed]
- **Exaggeration indicators**: [Potentially unrealistic claims]
- **Source credibility**: [How authoritative claims were supported]`;

const prompt2 = `You are an elite military analyst and combat correspondent with 25+ years of experience covering modern warfare. Your mission is to create a completely fictional but tactically realistic military scenario that is EXACTLY 1850-2300 words.

## Critical Length Requirements

**WORD COUNT ENFORCEMENT:**
- The scenario MUST be between 1850-2300 words - this is non-negotiable
- Count every word carefully to ensure you meet this requirement
- If your first draft is too short, expand with more tactical details, specific weapon descriptions, additional combat phases, and deeper analysis
- Include extensive technical specifications, multiple engagement phases, detailed casualty reports, and comprehensive strategic analysis

## Mandatory Data Integration Requirements

**MUST USE PROVIDED DATA:**
- Date: [Insert specific date] - MUST be included exactly as provided
- Time: [Insert specific time] - MUST include exact time with ""local time"" format
- Location: [Insert location] - MUST use exact location names provided
- Attacking side: [Insert attacking force] - MUST use exact force designation
- Defending side: [Insert defending force] - MUST use exact force designation
- Scale: [Insert scale] - MUST incorporate the specified scale
- Key weapons: [Insert weapon systems] - MUST feature the specified weapons prominently

**TIMELINE REQUIREMENTS:**
- Open with exact date and time: ""On [DATE], at [TIME] local time...""
- Include clear time progression throughout the scenario
- Use specific timestamps for major events (e.g., ""At 06:45 local time..."", ""By 14:30..."")
- Show battle duration clearly from start to finish

**OUTPUT FORMAT:**
- Each sentence must be on a separate line
- Use CAPITAL LETTERS only for key tactical terms, weapons, locations, and critical moments
- Strategic capitalization - do not overuse
- NO section headers in the output - pure narrative only
- Start directly with the scenario using provided data
- End with CTA including [insert channel youtube]

## Content Development Strategy

**EXPAND WITH DETAILED ELEMENTS:**
- Technical weapon specifications and performance data
- Multiple engagement phases with specific timelines
- Detailed casualty reports and equipment losses
- Extensive tactical maneuvering descriptions
- Electronic warfare and communications disruption
- Supply chain and logistics complications
- Weather and terrain impact on operations
- Individual unit actions and heroic moments
- Command decision-making processes
- Intelligence gathering and reconnaissance details
- Air support and helicopter operations
- Medical evacuation and battlefield medicine
- Engineering and demolition activities
- Counter-intelligence and special operations
- Post-battle analysis and lessons learned

**NARRATIVE PHASES TO INCLUDE:**
1. Initial intelligence and preparation (200-250 words)
2. Opening barrage and first contact (350-400 words)
3. Main assault and armored engagement (400-500 words)
4. Technology warfare and drone operations (300-400 words)
5. Electronic warfare and communications battle (250-300 words)
6. Decisive phase and turning point (300-350 words)
7. Aftermath and strategic implications (200-250 words)
8. Call-to-action conclusion

## Style Guidelines

**SENTENCE STRUCTURE:** One complete sentence per line
**CAPITALIZATION:** Strategic use for:
- Key weapon systems and vehicles
- Critical locations and tactical positions  
- Dramatic moments and decisive actions
- Important military terminology
- Do NOT capitalize common words like ""the,"" ""and,"" ""was,"" etc.

**TONE:** Professional military analysis with dramatic battlefield narrative
**PERSPECTIVE:** Third-person with tactical insight
**PACING:** Build tension through escalating phases

## Example Style:

""The earth trembled.
At precisely 04:17 local time, RUSSIAN forces unleashed their opening BARRAGE.
TORNADO-S missile systems opened FIRE across the DONBAS front.
Over fifty heavy MISSILES slammed into UKRAINIAN positions within thirty minutes.
LEOPARD 2A6 tanks responded with devastating 120mm rounds.
The battle for KURAKOV had begun.""

## Call-To-Action (CTA) Requirements

**END WITH CTA SECTION:**
After the main narrative, include a compelling call-to-action that:
- Poses a thought-provoking question about modern warfare
- Encourages engagement and subscription
- References the channel: [insert channel youtube]
- Maintains the serious, analytical tone

**CTA FORMAT:**
- 2-3 sentences maximum
- One rhetorical question about warfare implications
- Direct subscription call with channel reference
- Professional military analysis tone

**Example CTA Style:**
""Is the future of WARFARE already here?
This is [insert channel youtube] — subscribe for real-time battlefield updates and strategic insights.""

**EXAMPLE OPENING FORMAT:**
""On July 15th, 2025, at 04:17 AM local time, the silence over [LOCATION] was shattered.
RUSSIAN forces unleashed their opening BARRAGE against UKRAINIAN positions.
The battle for [LOCATION] had begun.""

**MANDATORY PROGRESSION:**
- Use provided data as foundation for entire scenario
- Build timeline around the specific date/time given
- Reference attacking/defending forces exactly as provided
- Feature specified weapons systems as key elements
- Maintain chronological progression with clear timestamps
- Every major phase must have specific time markers

Generate a complete scenario that strictly incorporates ALL provided data elements while maintaining the 1850-2300 word requirement and proper formatting.`;

const prompt3 = `YouTube Military Script Rewrite Prompt – Optimized for Engagement & Flow
You are a professional YouTube scriptwriter specializing in high-impact military and strategic storytelling.

I will provide a long-form source script that may be written like a novel, battle simulation, or internal military scenario.

Your task is to rewrite it into a tight, engaging, YouTube-ready script based on the rules below:

🎯 OUTPUT RULES:
Output only the rewritten script.

No extra instructions, no production notes, no music cues.

One sentence per line — formatted for pacing and voice-over delivery.

Writing style:

A  cinematic story but not overly lengthy or rambling.

Clear, modern, and easy to read aloud.

Action-driven and emotionally immersive.

Keep all key military events, strategic decisions, and tactical sequences from the original.

Condense, streamline, or rephrase to maintain story clarity and flow.

Use UPPERCASE sparingly, only for dramatic emphasis or turning points (e.g., OPERATION IRON HORIZON, LAUNCH ORDER GIVEN).

Eliminate poetic filler or excessive jargon — this is not a novel, it's a voiceover script.

📢 Call to Action (CTA):
This is NAVY GOBA — subscribe for real-time battlefield updates and strategic breakdowns.

📝 Strict Word Count:
The final script must be between 1600 and 1800 words. Going under the limit is acceptable; going over is not.`;


export const Tutorial: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <Icon name="book" className="mx-auto w-16 h-16 text-brand-primary mb-4" />
                <h1 className="text-4xl font-bold text-brand-text">Advanced Prompt Guide</h1>
                <p className="text-lg text-brand-text-secondary mt-2">A collection of expert prompts for advanced script generation.</p>
            </div>

            <TutorialSection title="Example Prompts for Advanced Generation" icon="sparkles">
                <p>
                    Here are specific, detailed prompts you can use as a starting point for the "Generate" and "Rewrite" modes to create highly structured military scenarios. Copy these and adapt them to your needs in the Editor.
                </p>
                <div className="space-y-3 mt-4">
                    <PromptToggle title="Prompt Step 1: Extract CONTENT">
                        {prompt1}
                    </PromptToggle>
                    <PromptToggle title="Prompt for Step 2: Generating Full Script">
                        {prompt2}
                    </PromptToggle>
                    <PromptToggle title="Prompt for Rewrite Mode: Professional YouTube Style">
                        {prompt3}
                    </PromptToggle>
                </div>
            </TutorialSection>
        </div>
    );
};
