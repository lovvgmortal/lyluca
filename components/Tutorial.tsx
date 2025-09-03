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

STRUCTURE

Opening Hook (Shock & Awe)

Natural Audience Hook (Choice-Based Poll)

Body (3 parts, 800-1000 words each)

Part 1: Background + Initial Attack

Part 2: Defensive Response + Escalation

Part 3: Final Destruction + Aftermath

[OPTIMIZED SECTION] CORE NARRATIVE REQUIREMENT: Throughout the body, you MUST introduce elements of the "Friction of War." This includes equipment malfunctions, communication breakdowns, misinterpreted orders, and the pure chaos of the battlefield that makes even the best plans go awry. Victory must feel earned, not effortless.

Conclusion (400-600 words)

Ending Question Requirements

TOTAL TARGET: 2900-3300 words

PACING AND RHYTHM CONTROL

One Sentence Per Line Rule: Every sentence must be on its own line.

Pacing Variation: Use a mix of short, medium, and long sentences based on tension.

Use of Ellipses for Pacing: Use ellipses ... intentionally to create dramatic pauses.

Strategic Capitalization for Emphasis: Use ALL CAPS for single words or short phrases sparingly.

AUDIENCE INTERACTION LAYERS

Scenario-Based Questions (5-6 times throughout).

Audience Connection Points (2-3 times).

Natural Subscribe Integration (4-5 strategic placements).

Tactical Pauses (3-4 times).

TECHNICAL INTEGRATION

Weave Technical Specifications into the action.

Use Comparisons & Metaphors.

[OPTIMIZED SECTION] Connect Specs to Reality: When describing weapons performance, connect it to the brutal reality of its effects. Don't just state the specs; describe the visceral impact to emphasize the stakes of the battle.

[OPTIMIZED SECTION] EMOTIONAL ENGAGEMENT & REALISM

Complex Human Elements: Do not write flawless heroes. Show moments of fear, doubt, or hesitation even in the defenders. Illustrate how small acts of ingenuity from low-ranking soldiers (e.g., a sergeant noticing a key detail) can be decisive. Give the enemy a human face where appropriate (e.g., a terrified young conscript) to make the conflict more grounded.

Embrace the "Near-Failure": Crucially, you must create at least one significant "near-failure" moment for the defending side. This could be a technical malfunction, a communications breakdown, or a tactical miscalculation that is narrowly averted. This raises the stakes and makes the victory feel earned, not inevitable.

Moral Framework: While maintaining a clear protagonist (the defenders fighting for a righteous cause), the narrative should be about overcoming chaos and adversity, not just a simple story of good vs. evil. The true heroism is demonstrated through resilience and humanity amidst brutality.

Human Cost: Show, don't just tell, the human cost of the conflict. Instead of only stating casualty numbers, use visceral, purposeful descriptions of the battlefield's reality. This is not for shock value alone, but to give weight and meaning to the defenders' struggle and ultimate victory.
`;

const prompt3 = `
Using the outline and database provided, write a complete military scenario script optimized for ElevenLabs text-to-speech. Your output must be ONLY the final, raw script text. Do not include any headings, section titles, or any other text that is not part of the narration.

Core Thematic Goal: The script must function as a "Trojan Horse." It should engage an audience interested in military strategy and technology for the first ~80% of the script. However, the final conclusion must pivot dramatically to deliver a strong, unambiguous commentary that is anti-violence, anti-war, and pro-peace. The detailed destruction and advanced technology described earlier in the script must be re-framed as a cautionary tale about the horrific futility of modern conflict.

STRUCTURE

Opening Hook (Shock & Awe)

Natural Audience Hook (Choice-Based Poll)

Body (3 parts, 800-1000 words each)

Background + Initial Attack

Defensive Response + Escalation

Final Destruction + Aftermath

[OPTIMIZED SECTION] CORE NARRATIVE REQUIREMENT: Throughout the body, while focusing on tactical excellence, you MUST introduce elements of the "Friction of War." Show that the battle is chaotic, messy, and unpredictable. This makes the tactical success more gripping and subtly primes the audience for the final anti-war message by showing that war is not a clean science.

Conclusion (400-600 words) - Thematic Pivot

Begin by analyzing the "victory" tactically, then immediately pivot to question the meaning of victory.

The conclusion must shift to a sober, reflective commentary on the horrific human, environmental, and psychological cost. It must explicitly state that there are no true winners.

Humanize all sides, deconstructing the "enemy" concept.

The core message must be an unambiguous advocacy for diplomacy and peace.

Ending Question Requirements - Thematic Challenge

The final question must be the culmination of the anti-war analysis, challenging the audience to reject the glorification of military technology and consider the moral imperative for peace.

TOTAL TARGET: 2900-3300 words

PACING AND RHYTHM CONTROL

One Sentence Per Line Rule: Every sentence must be on its own line.

Pacing Variation: Use a mix of short, medium, and long sentences based on tension.

Use of Ellipses for Pacing: Use ellipses ... intentionally to create dramatic pauses.

Strategic Capitalization for Emphasis: Use ALL CAPS for single words or short phrases sparingly.

AUDIENCE INTERACTION LAYERS

Scenario-Based Questions (5-6 times throughout).

Audience Connection Points (2-3 times).

Natural Subscribe Integration (4-5 strategic placements).

Tactical Pauses (3-4 times).

TECHNICAL INTEGRATION

Weave Technical Specifications into the action.

Use Comparisons & Metaphors.

[OPTIMIZED SECTION] EMOTIONAL ENGAGEMENT & NARRATIVE SETUP

Complex Human Elements & Near-Failure: Even in the body, show moments of human complexity. Create at least one "near-failure" moment for the defending side. A more desperate and flawed battle makes the final pivot to the tragedy of war feel more natural and earned, rather than an abrupt lecture.

Moral Framework: The narrative should initially present a seemingly clear "defender vs. aggressor" scenario to engage the audience, but the conclusion must deconstruct this binary to reveal the shared human tragedy.

Human Cost Balance: The body of the script should focus on tactical excellence, but it should include glimpses of the brutal, visceral human cost of these tactics (e.g., describe the effect of an explosion, not just that it happened). This prevents the final pivot from feeling disconnected. The conclusion then heavily expands on this theme to serve its ultimate anti-war message.
`;

const prompt4 = `
## PROMPT CHÍNH:

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

Scenario I want: [Describe your specific idea here + specify primary domain]
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
                    <PromptToggle title="Prompt 3: Generating Full Script 2">
                        {prompt3}
                    </PromptToggle>
                    <PromptToggle title="Prompt 4: Create DATA">
                        {prompt4}
                    </PromptToggle>
                </div>
            </TutorialSection>
        </div>
    );
};
