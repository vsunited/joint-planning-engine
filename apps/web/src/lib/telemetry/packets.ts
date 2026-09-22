import type { CombatantCommand, PlanningEchelon } from '@jpe/shared';
import { TrialPacket } from './types';

/**
 * Trial stimulus packets.
 *
 * Two higher-HQ directives, one per condition. Every participant sees both —
 * one with the tool, one without — so each is their own control, and the
 * packet order is counterbalanced against the arm order.
 *
 * The two are deliberately matched rather than merely similar. Both run to
 * five numbered paragraphs, assign five subordinate tasks, impose three
 * constraints and two restraints, allocate five force elements and fix three
 * date-time groups. A difference in completion time should be attributable to
 * the method, not to one packet being denser than the other.
 *
 * Both scenarios are fictional and written for this trial. They carry no real
 * unit, plan or intelligence content, which is what allows the trial data to
 * be published alongside a competition submission.
 */

export interface PacketDefinition {
  id: TrialPacket;
  operation: string;
  issuer: string;
  body: string;
  /**
   * The workspace header for this packet's tool-arm session.
   *
   * Without this the app always announced JTF-Horn of Africa and Operation
   * Sentinel Resolve, which happens to be packet A. A packet A participant
   * would have found the tool already oriented to their directive while a
   * packet B participant read a header contradicting theirs — a head start for
   * one packet and an obstacle for the other, landing directly in the measure
   * the trial exists to take.
   */
  scenario: {
    operationName: string;
    aorRegion: string;
  };
  /**
   * The headquarters the packet is addressed to.
   *
   * A trial run plans as the JTF named in its own directive, so the workspace
   * is levelled to the packet rather than to whatever the machine was last set
   * to. Without this a participant on the tool arm could be classifying tasks
   * against a different headquarters than the order they were handed.
   */
  echelon: PlanningEchelon;
}

const PACKET_A: PacketDefinition = {
  id: 'A',
  operation: 'OPERATION SENTINEL RESOLVE',
  issuer: 'USAFRICOM to JTF-Horn of Africa',
  echelon: {
    level: 'jtf',
    designation: 'JTF-Horn of Africa',
    establishedBy: 'USAFRICOM',
    multinational: false,
  },
  scenario: {
    operationName: 'Sentinel Resolve',
    aorRegion: 'Bab-el-Mandeb & Southern Red Sea',
  },
  body: [
    'UNCLASSIFIED — FICTIONAL TRAINING SCENARIO',
    'PLANORD 26-04 / USAFRICOM TO COMMANDER, JTF-HORN OF AFRICA',
    'DTG: 210600Z SEP 26',
    '',
    '1. SITUATION',
    '   a. General. Sustained anti-ship cruise missile and one-way attack UAS',
    '      fire from the Yemeni coast has closed the Bab-el-Mandeb to commercial',
    '      traffic. Fourteen carriers have suspended transits. Insurance rates on',
    '      the route have tripled in nineteen days.',
    '   b. Enemy. Irregular forces hold six confirmed and four suspected coastal',
    '      launch sites between Al Hudaydah and Mocha, supported by mobile',
    '      maritime surveillance radar. They have demonstrated the ability to',
    '      relocate a launcher within ninety minutes of firing.',
    '   c. Friendly. CTF-153 operates two destroyers in the southern Red Sea. A',
    '      French frigate and an Italian frigate are conducting independent',
    '      escort. Djibouti has granted expanded port and airfield access.',
    '',
    '2. MISSION. JTF-Horn of Africa conducts maritime security operations in the',
    '   Bab-el-Mandeb and southern Red Sea to restore freedom of navigation for',
    '   commercial shipping NLT 15 NOV 26.',
    '',
    '3. EXECUTION',
    '   a. Commander\'s Intent. Reopen the strait to commercial traffic without',
    '      committing ground forces ashore. Success is sustained commercial',
    '      transit at pre-crisis volume for fourteen consecutive days.',
    '   b. Tasks to Subordinate Units.',
    '      (1) Establish and sustain a maritime escort corridor for commercial',
    '          shipping transiting the strait.',
    '      (2) Conduct strikes against confirmed ASCM launch sites as authorized.',
    '      (3) Coordinate escort scheduling with partner naval forces.',
    '      (4) Establish forward logistics support at Djibouti.',
    '      (5) Provide daily maritime domain awareness reporting to USAFRICOM.',
    '   c. Coordinating Instructions.',
    '      (1) CONSTRAINT: Escort operations begin NLT 01 NOV 26.',
    '      (2) CONSTRAINT: Maintain continuous coverage of the transit corridor.',
    '      (3) CONSTRAINT: Coordinate all strikes through USAFRICOM targeting.',
    '      (4) RESTRAINT: No ground forces ashore in Yemen.',
    '      (5) RESTRAINT: No strikes within 2km of confirmed civilian population.',
    '',
    '4. ADMINISTRATION AND LOGISTICS. Forces allocated: one destroyer squadron',
    '   (4x DDG), one P-8A detachment, one MQ-9 detachment, one expeditionary',
    '   logistics element, one EOD/mine countermeasures detachment. Djibouti',
    '   serves as primary sustainment node.',
    '',
    '5. COMMAND AND SIGNAL. CDR JTF-HOA retains OPCON of allocated forces.',
    '   Key dates: M-Day 01 OCT 26. C-Day 20 OCT 26. D-Day 01 NOV 26.',
  ].join('\n'),
};

const PACKET_B: PacketDefinition = {
  id: 'B',
  operation: 'OPERATION IRON MERIDIAN',
  issuer: 'USCENTCOM to JTF-Arabian Gulf',
  echelon: {
    level: 'jtf',
    designation: 'JTF-Arabian Gulf',
    establishedBy: 'USCENTCOM',
    multinational: false,
  },
  scenario: {
    operationName: 'Iron Meridian',
    aorRegion: 'Strait of Hormuz & Gulf of Oman',
  },
  body: [
    'UNCLASSIFIED — FICTIONAL TRAINING SCENARIO',
    'PLANORD 26-09 / USCENTCOM TO COMMANDER, JTF-ARABIAN GULF',
    'DTG: 210600Z SEP 26',
    '',
    '1. SITUATION',
    '   a. General. Repeated fast-attack craft swarming and the discovery of',
    '      moored influence mines have closed the Strait of Hormuz to commercial',
    '      traffic. Eleven carriers have suspended transits. Insurance rates on',
    '      the route have quadrupled in twenty-two days.',
    '   b. Enemy. Irregular naval forces operate from five confirmed and five',
    '      suspected small-craft harbours along the Gulf of Oman coast, supported',
    '      by shore-based targeting radar. They have demonstrated the ability to',
    '      disperse a swarm element within two hours of an engagement.',
    '   c. Friendly. CTF-152 operates two destroyers in the central Gulf. A UK',
    '      minehunter and an Australian frigate are conducting independent',
    '      escort. Bahrain has granted expanded port and airfield access.',
    '',
    '2. MISSION. JTF-Arabian Gulf conducts maritime security operations in the',
    '   Strait of Hormuz and Gulf of Oman to restore freedom of navigation for',
    '   commercial shipping NLT 15 NOV 26.',
    '',
    '3. EXECUTION',
    '   a. Commander\'s Intent. Reopen the strait to commercial traffic without',
    '      committing ground forces ashore. Success is sustained commercial',
    '      transit at pre-crisis volume for fourteen consecutive days.',
    '   b. Tasks to Subordinate Units.',
    '      (1) Establish and sustain a maritime escort corridor for commercial',
    '          shipping transiting the strait.',
    '      (2) Conduct mine countermeasures operations in the transit corridor.',
    '      (3) Coordinate escort scheduling with partner naval forces.',
    '      (4) Establish forward logistics support at Bahrain.',
    '      (5) Provide daily maritime domain awareness reporting to USCENTCOM.',
    '   c. Coordinating Instructions.',
    '      (1) CONSTRAINT: Escort operations begin NLT 01 NOV 26.',
    '      (2) CONSTRAINT: Maintain continuous coverage of the transit corridor.',
    '      (3) CONSTRAINT: Coordinate all engagements through USCENTCOM targeting.',
    '      (4) RESTRAINT: No ground forces ashore in Iran.',
    '      (5) RESTRAINT: No engagement within 2km of confirmed civilian vessels.',
    '',
    '4. ADMINISTRATION AND LOGISTICS. Forces allocated: one destroyer squadron',
    '   (4x DDG), one P-8A detachment, one MH-53E detachment, one expeditionary',
    '   logistics element, one EOD/mine countermeasures detachment. Bahrain',
    '   serves as primary sustainment node.',
    '',
    '5. COMMAND AND SIGNAL. CDR JTF-AG retains OPCON of allocated forces.',
    '   Key dates: M-Day 01 OCT 26. C-Day 20 OCT 26. D-Day 01 NOV 26.',
  ].join('\n'),
};

export const TRIAL_PACKETS: Record<TrialPacket, PacketDefinition> = {
  A: PACKET_A,
  B: PACKET_B,
};
