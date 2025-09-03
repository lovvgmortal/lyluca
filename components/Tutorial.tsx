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

const prompt2 = `
Using the outline and database provided, write a complete military scenario script optimized for ElevenLabs text-to-speech. Your output must be ONLY the final, raw script text. Do not include any headings, section titles, or any other text that is not part of the narration.

Core Thematic Goal: The script must function as a "Trojan Horse." It should engage an audience interested in military strategy and technology for the first ~80% of the script. However, the final conclusion must pivot dramatically to deliver a strong, unambiguous commentary that is anti-violence, anti-war, and pro-peace. The detailed destruction and advanced technology described earlier in the script must be re-framed as a cautionary tale about the horrific futility of modern conflict.

STRUCTURE

Opening Hook (Shock & Awe)

4-5 rapid, shocking sentences: Start immediately with the largest numbers of casualties and destruction.

No time/date setup: Jump straight into the action.

Example: "Forty-eight drones destroyed in under sixty seconds. Eight hundred elite soldiers wiped off the battle map. Over twelve billion dollars in advanced military hardware turned to scrap metal in a single counter-attack. This is what happened when..."

Natural Audience Hook (Choice-Based Poll)

Immediately following the shocking opening, pose a direct choice question (A vs. B) to create an instant poll in the comments. This question must frame the script's central conflict (e.g., technology, tactics, force types) and serve as a direct bridge into the narrative.

Examples:

"Swarms of low-cost drones... or a single, billion-dollar main battle tank? Which weapon TRULY defines the modern battlefield? Comment your choice below, and let's see how this scenario answers that very question."

"A BOLD preemptive strike... or an IMPENETRABLE defensive fortress? Which strategy leads to absolute victory? Let's find out."

Body (3 parts, 800-1000 words each)

Background + Initial Attack: Delve into the reasons for the conflict, with detailed descriptions of forces, weapons, and initial damage.

Defensive Response + Escalation: Enhance the description of defensive systems, countermeasures, and a highly detailed "turning point" in the battle.

Final Destruction + Aftermath: Focus intensely on the climax, describing the destruction in a rapid, detailed manner.

Conclusion (400-600 words) - [EDITED SECTION]

Thematic Pivot: Begin by analyzing the "victory" from a tactical standpoint, then immediately pivot to question the very meaning of victory.

Anti-War Commentary: The conclusion must shift from a tactical analysis to a sober, reflective commentary on the horrific human, environmental, and psychological cost of the conflict described. It must explicitly state that there are no true winners in modern warfare.

Humanize All Sides: Use the conclusion to deconstruct the "enemy" concept, focusing on the humanity of the soldiers on both sides and the civilians impacted.

Advocate for Peace: The core message must be an unambiguous advocacy for diplomacy, de-escalation, and peaceful solutions as the only real form of victory. The tone should be somber and cautionary.

Ending Question Requirements - [EDITED SECTION]

The final question must be the culmination of the anti-war analysis. It must challenge the audience to reject the glorification of military technology and consider the moral imperative for peace. The goal is to leave a lasting impression that questions the very validity of war in the modern age.

Example: "In a world with technology capable of such instantaneous and total destruction, is the concept of a 'winnable war' now completely obsolete? And what is our personal responsibility to demand peaceful solutions before the first shot is ever fired?"

TOTAL TARGET: 2900-3300 words (12-15 minutes of narration)

PACING AND RHYTHM CONTROL

Opening Shock (Tension 9/10): 4-5 rapid-fire, short sentences (3-6 words).

Background Build-up (Tension 7/10): Maintain tension while explaining context, mixing long and short sentences.

Initial Attack (Tension 9/10): Increase the pace as the action begins, using medium-length sentences (6-12 words).

Peak Climax (Maximum Tension 10/10): Shortest sentences (2-5 words) for maximum effect. Rapid-fire, using strong periods and ellipses.

Resolution (Tension 7/10): Return to longer sentences (12-18 words), describing the aftermath in detail.

WRITING STYLE & FORMAT

One Sentence Per Line Rule: Every sentence must be on its own line. This is crucial for TTS pacing.

Word Count Requirement: Minimum 2900 words. Expand sections naturally with more detail to reach the word count.

No Reading Instructions: Do not include instructions like [pause] or [emphasize]. Write only the pure script content.

Use of Ellipses for Pacing: Use ellipses ... intentionally to create short, dramatic pauses for the AI narrator.

Strategic Capitalization for Emphasis: Use ALL CAPS for single words or short phrases that require strong emphasis. Use sparingly.

AUDIENCE INTERACTION LAYERS

Scenario-Based Questions (5-6 times throughout).

Audience Connection Points (2-3 times).

Natural Subscribe Integration (4-5 strategic placements).

Tactical Pauses (3-4 times).

TECHNICAL INTEGRATION

Weave Technical Specifications into the action.

Use Comparisons: "This explosion was equivalent to fifteen city blocks..."

Use Metaphors for Complexity: "The radar system acted like an electronic spider's web..."

EMOTIONAL ENGAGEMENT

Individual Stories: Give names to specific pilots or commanders with key moments.

Moral Framework - [EDITED SECTION]: The narrative should initially present a seemingly clear "defender vs. aggressor" scenario to engage the audience, but the conclusion must deconstruct this binary to reveal the shared human tragedy and moral ambiguity of armed conflict.

Human Cost Balance: The body of the script should focus on tactical excellence, but the conclusion must heavily emphasize the human and environmental cost to serve its anti-war message.

Generate the complete script now.
`;

const prompt3 = `## PROMPT CHÍNH:

**QUAN TRỌNG - NGUYÊN TẮC VÀNG "MÔ TẢ CHI TIẾT":** Đối với MỌI mục trong dàn ý và database dưới đây, bạn phải cung cấp câu trả lời mang tính MÔ TẢ và GIÀU CHI TIẾT. Đừng chỉ liệt kê tên, hãy giải thích chức năng và tầm quan trọng của nó. Thay vì đưa ra một sự kiện, hãy mô tả nó trong 2-3 câu. Mục tiêu là tạo ra một kho dữ liệu "giàu có", không phải một danh sách gạch đầu dòng.

**Ví dụ về cách làm ĐÚNG:**
- **Thay vì (SAI):** Tên lửa: Javelin
- **Hãy viết (ĐÚNG):** Tên lửa chống tăng: Javelin FGM-148, một hệ thống "bắn và quên" dẫn đường bằng hồng ngoại, nổi tiếng với khả năng tấn công nóc xe tăng (top-attack), nơi có lớp giáp mỏng nhất. Tầm bắn hiệu quả 2,500 mét của nó cho phép bộ binh tạo ra các cuộc phục kích chết người từ khoảng cách an toàn.

**CHỈ DẪN LOGIC & NHẤT QUÁN:** Bạn phải đảm bảo tất cả thông tin bạn tạo ra là nhất quán. Số liệu, tên đơn vị, địa điểm, và dòng thời gian phải khớp nhau hoàn hảo giữa PART A (Cấu trúc câu chuyện) và PART B (Database kỹ thuật). Ví dụ, nếu PART A nói về một cuộc tấn công bằng drone, PART B phải có thông số chi tiết của loại drone đó.

# PART A: SCENARIO OVERVIEW & NARRATIVE STRUCTURE

## BASIC CONCEPT:
- **Title Hook**: [Catchy title với số liệu shock - VD: "50,000 Soldiers vs 200 Drones"]
- **Core Message**: [Thông điệp chính - technology vs numbers, precision vs force, etc.]
- **Conflict Type**: [Asymmetric defense, technological superiority, surprise attack]
- **Target Audience**: [Military enthusiasts, geopolitics fans, tech warfare interested]

## STORY STRUCTURE (20-minute video):
### Opening Hook (0-2 min):
- **Shock opener**: [Specific scene với exact numbers]
- **Stakes**: [What's at risk - base, civilians, strategic position]

### Background (2-5 min): 
- **Context**: [Why this conflict started]
- **Previous events**: [What led to this moment]
- **Forces involved**: [Brief overview of capabilities]

### Phase 1 - Initial Strike (5-9 min):
- **Attack method**: [Surprise/overwhelming/coordinated]
- **First casualties**: [Immediate damage, shock value]
- **Defender reaction**: [Confusion, rapid response]

### Phase 2 - Escalation (9-15 min):
- **Defense activation**: [Systems coming online]
- **Counter-measures**: [Technology vs technology]
- **Turning point**: [When tide shifts]

### Phase 3 - Resolution (15-18 min):
- **Decisive action**: [Final overwhelming response]
- **Destruction details**: [Specific damage, costs]
- **Enemy defeat**: [How completely they lost]

### Conclusion (18-20 min):
- **Lessons learned**: [Strategic implications]
- **Message to world**: [Deterrence, power demonstration]
- **Call to action**: [Subscribe, comment, support]

# PART B: DETAILED TECHNICAL DATABASE

## BASIC INFORMATION:
- **Date**: [Specific date from 2024-2026]
- **Location**: [Specific coordinates, city/base name, strategic importance]
- **Attacking side**: [Country + specific units/commanders]
- **Defending side**: [Country + garrison strength/leadership]
- **Weather/Terrain**: [Conditions affecting combat]
- **Duration**: [Exact timeline from first shot to surrender]

## GROUND FORCES SPECIFICATIONS:

### ATTACKING FORCE:
- **Main Battle Tanks**: 
  - Type: [T-90M, T-80BVM, etc.]
  - Number: [Exact count]
  - Specifications: [Armor thickness, gun caliber, speed, cost per unit]
  - Combat load: [Ammunition types, fuel capacity]

- **Infantry Forces**:
  - Total: [Exact number + breakdown by unit type]
  - Equipment: [Body armor, weapons, communications]
  - Training level: [Elite/Regular/Conscript with experience details]
  - Support: [Medics, engineers, logistics]

- **Unmanned Systems**:
  - **Strike UAVs**: [Orlan-10, Lancet-3 with specs]
    - Range: [km], Payload: [kg], Speed: [km/h]
    - Guidance: [GPS, optical, AI-assisted]
    - Cost: [$ per unit]
  - **Surveillance**: [Reconnaissance capabilities]

- **Artillery Systems**:
  - Type: [Tornado-S, Grad, Iskander]
  - Range: [Maximum engagement distance]
  - Ammunition: [HE, cluster, precision guided]
  - Rate of fire: [Rounds per minute]

### DEFENDING FORCE:
- **Defensive Positions**:
  - **Armor**: [Leopard 2A6, Challenger 2, M1A2]
    - Numbers: [Available units]
    - Positioning: [Hull-down, urban, open terrain]
    - Ammunition: [APFSDS, HEAT, canister]

- **Anti-Tank Systems**:
  - **Missiles**: [Javelin, NLAW, TOW specifications]
    - Range: [m], Penetration: [mm RHA equivalent]
    - Guidance: [Fire-and-forget, wire-guided]
    - Success rate: [% against modern armor]

- **Air Defense**:
  - **Radar**: [AN/TPQ-50, NASAMS coverage area]
  - **Interceptors**: [Patriot, THAAD, Iron Dome]
  - **SHORAD**: [Stinger, Phalanx CIWS]

- **Artillery Support**:
  - **Long-range**: [HIMARS, M777, Caesar]
  - **Precision**: [Excalibur, BONUS, SMArt 155]
  - **Counter-battery**: [Radar detection, rapid response]

## DOMAIN-SPECIFIC FORCES (Choose relevant domains only):

### IF NAVAL SCENARIO (coastal/island/maritime):
- **Surface Combatants**: [Destroyer/Frigate class, armament]
- **Submarines**: [Attack/Strategic, torpedo/missile loadout]  
- **Naval Aviation**: [Carrier-based, maritime patrol]
- **Coastal Defense**: [Shore-based missiles, mines]
- **Amphibious Forces**: [Landing craft, marines, beach assault]

### IF AIR SUPERIORITY FOCUS:
- **Fighter Aircraft**: 
  - **Attacking**: [Su-35, Su-57 numbers and loadouts]
  - **Defending**: [F-35, F-22, F-16 availability]
  - **Specifications**: [Speed, range, weapons capacity, radar]
- **Air Defense Network**:
  - **SAM Systems**: [S-400, Patriot, NASAMS engagement envelopes]
  - **Early Warning**: [AWACS, ground radar coverage]

### IF GROUND COMBAT FOCUS:
- **Air Support**: [Close air support, attack helicopters only]
- **Artillery**: [Counter-battery, precision strikes]
- **Electronic Warfare**: [Tactical jamming, communications]

### IF COMBINED ARMS:
- **Relevant domains**: [Specify which 2-3 domains make sense geographically]
- **Integration**: [How domains support each other]

## ECONOMIC & LOGISTICS DATA:
- **Attack Cost**: [Total $ for operation including fuel, ammunition]
- **Defense Cost**: [Interceptor missiles, fuel, personnel]
- **Damage Assessment**: [Infrastructure, equipment losses in $]
- **Replacement Time**: [How long to rebuild/restock]

## COMBAT TIMELINE (Minute-by-Minute):
### H-Hour to H+15:
- [Specific events with exact times]
- [Casualties and equipment losses]
- [Communication intercepts/decisions]

### H+15 to H+45:
- [Escalation phases]
- [Technology deployments]
- [Tactical shifts]

### H+45 to Resolution:
- [Final assault/defense]
- [Decisive factors]
- [Surrender/withdrawal]

## HUMAN STORIES & EMOTIONAL CORE:
- **Key Commanders**: [Name at least two commanders (one on each side). Describe a critical decision each one makes under pressure. Include a short internal thought or a line of dialogue.]
- **Soldier's Perspective**: [Describe a specific moment from the point of view of a low-ranking soldier (e.g., a tank gunner, a drone operator, an infantryman). Focus on the sensory details: what they see, hear, and feel.]
- **Civilian Impact**: [If applicable, describe the situation for civilians. Are they being evacuated? Are they caught in the crossfire? Show the human cost of the conflict.]

## STRATEGIC IMPLICATIONS:
- **Military Lessons**: [Doctrine changes needed]
- **Technology Trends**: [What worked/failed]
- **Geopolitical Impact**: [Alliance shifts, deterrence effects]
- **Economic Consequences**: [Market reactions, defense spending]

## SCENARIO TYPE SELECTION GUIDE:

**NAVAL SCENARIOS** - Use when:
- Island defense (Taiwan, Guam, UK)
- Coastal invasion (Normandy-style landings)
- Strait control (Hormuz, Malacca, Bosphorus)
- Carrier strike group vs shore defenses
- Include: Naval forces + Air support + Coastal ground forces

**GROUND SCENARIOS** - Use when:
- Continental warfare (Ukraine plains, European borders)
- Mountain/desert combat (Afghanistan, Middle East)
- Urban warfare (city sieges, airport battles)
- Include: Ground forces + Close air support + Artillery

**AIR SUPERIORITY SCENARIOS** - Use when:
- SEAD operations (suppressing air defenses)
- Strategic bombing campaigns
- Fighter vs fighter engagements
- Include: Air forces + Ground-based air defense + Limited ground support

**COMBINED ARMS** - Use when:
- Large-scale multi-domain operations
- Amphibious assaults with air cover
- Multi-theater campaigns
- Include: 2-3 relevant domains that make geographic sense

Scenario I want: [Describe your specific idea here + specify primary domain]`;

const prompt4 = `


Using the outline and database provided, write a complete military scenario script optimized for ElevenLabs text-to-speech. Your output must be ONLY the final, raw script text. Do not include any headings, section titles (e.g., "The Fatal Miscalculation"), or any other text that is not part of the narration.

STRUCTURE
Opening Hook (Shock & Awe)
4-5 rapid, shocking sentences: Start immediately with the largest numbers of casualties and destruction.

No time/date setup: Jump straight into the action.

Example: "Forty-eight drones destroyed in under sixty seconds. Eight hundred elite soldiers wiped off the battle map. Over twelve billion dollars in advanced military hardware turned to scrap metal in a single counter-attack. This is what happened when..."

Natural Audience Hook (Choice-Based Poll)
Immediately following the shocking opening, pose a direct choice question (A vs. B) to create an instant poll in the comments. This question must frame the script's central conflict (e.g., technology, tactics, force types) and serve as a direct bridge into the narrative.

Examples:

"Swarms of low-cost drones... or a single, billion-dollar main battle tank? Which weapon TRULY defines the modern battlefield? Comment your choice below, and let's see how this scenario answers that very question."

"A BOLD preemptive strike... or an IMPENETRABLE defensive fortress? Which strategy leads to absolute victory? Let's find out."

"A small, elite guerrilla force... or an overwhelming mechanized army? In this battle, does cunning or sheer POWER win the day?"

Body (3 parts, 800-1000 words each)
Background + Initial Attack: Delve into the reasons for the conflict, with detailed descriptions of forces, weapons, and initial damage.

Defensive Response + Escalation: Enhance the description of defensive systems, countermeasures, and a highly detailed "turning point" in the battle.

Final Destruction + Aftermath: Focus intensely on the climax, describing the destruction in a rapid, detailed manner.

Conclusion (400-600 words)
Deep analysis of strategic implications and the global message.

Express a strong sense of patriotism or a righteous cause, framed as the protection of peace and freedom.

Integrate a strong and natural call to action (CTA).

Must end with a compelling question to drive comments and discussion.

Ending Question Requirements
The final question must be the culmination of the entire analysis. It should force the audience to weigh the strategic, moral, and long-term consequences presented in the video. The goal isn't just to get comments, but to leave a lasting impression and extend the conversation.

TOTAL TARGET: 2900-3300 words (12-15 minutes of narration)

PACING AND RHYTHM CONTROL
Opening Shock (Tension 9/10): 4-5 rapid-fire, short sentences (3-6 words).

Background Build-up (Tension 7/10): Maintain tension while explaining context, mixing long and short sentences.

Initial Attack (Tension 9/10): Increase the pace as the action begins, using medium-length sentences (6-12 words).

Peak Climax (Maximum Tension 10/10): Shortest sentences (2-5 words) for maximum effect. Rapid-fire, using strong periods and ellipses.

Resolution (Tension 7/10): Return to longer sentences (12-18 words), describing the aftermath in detail.

WRITING STYLE & FORMAT
One Sentence Per Line Rule: Every sentence must be on its own line. This is crucial for TTS pacing.

Word Count Requirement: Minimum 2900 words. Expand sections naturally with more detail to reach the word count.

No Reading Instructions: Do not include instructions like [pause] or [emphasize]. Write only the pure script content.

Use of Ellipses for Pacing: Use ellipses ... intentionally to create short, dramatic pauses for the AI narrator. This helps modulate the rhythm and build suspense.

Strategic Capitalization for Emphasis: Use ALL CAPS for single words or short phrases that require strong emphasis. Use this technique sparingly to maximize impact. For example: "The system wasn't just disabled; it was COMPLETELY obliterated."

AUDIENCE INTERACTION LAYERS
Scenario-Based Questions (5-6 times throughout): Use the script's details to pose thought-provoking questions.

Audience Connection Points (2-3 times): Use phrases like "Whether you're active military, a veteran, or a civilian who believes in freedom..." to build rapport.

Natural Subscribe Integration (4-5 strategic placements): Link the call to subscribe to the value being provided. Example: "The specifics of this defense system change everything. Subscribe if you don't want to miss the full picture of modern warfare."

Tactical Pauses (3-4 times): At key turning points, pose a rhetorical question to the audience and then immediately answer it by continuing the narrative. Example: "They had one last option. A final, desperate gamble. Would it pay off?... The commander gave the order."

TECHNICAL INTEGRATION
Weave Technical Specifications: Integrate technical specs into the action, not as a list.

Use Comparisons: "This explosion was equivalent to fifteen city blocks being destroyed..."

Use Metaphors for Complexity: "The radar system acted like an electronic spider's web..."

EMOTIONAL ENGAGEMENT
Individual Stories: Give names to specific pilots or commanders with heroic moments.

Moral Framework: A clear good-vs-evil narrative.

Human Cost Balance: Briefly mention casualties to create seriousness, but focus on tactical excellence and the greater meaning of protecting freedom and peace.

Generate the complete script now.
`;
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
                    <PromptToggle title="Prompt 1: Extract CONTENT">
                        {prompt1}
                    </PromptToggle>
                    <PromptToggle title="Prompt 2: Generating Full Script">
                        {prompt2}
                    </PromptToggle>
                    <PromptToggle title="Prompt 3: Creater Content">
                        {prompt3}
                    </PromptToggle>
                    <PromptToggle title="Prompt 4:  Creater Content Viral ?">
                        {prompt4}
                    </PromptToggle>
                </div>
            </TutorialSection>
        </div>
    );
};
