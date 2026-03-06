'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating automated client status reports.
 *
 * - generateClientStatusReport - A function that synthesizes project data into a professional update.
 * - ClientStatusReportInput - The input type (project details and context).
 * - ClientStatusReportOutput - The structured professional report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClientStatusReportInputSchema = z.object({
  projectTitle: z.string(),
  customerName: z.string(),
  progress: z.number(),
  budget: z.number(),
  dueDate: z.string(),
  status: z.string(),
});
export type ClientStatusReportInput = z.infer<typeof ClientStatusReportInputSchema>;

const ClientStatusReportOutputSchema = z.object({
  reportTitle: z.string().describe('A professional title for the status report.'),
  executiveSummary: z.string().describe('A 2-3 sentence overview of the current project state.'),
  achievements: z.array(z.string()).describe('A list of 3 key milestones or achievements reached.'),
  nextSteps: z.array(z.string()).describe('A list of 2-3 immediate next actions.'),
  financialHealth: z.string().describe('A brief note on budget adherence and financial status.'),
  overallSentiment: z.enum(['Positive', 'Neutral', 'Attention Required']).describe('The general tone of the update.'),
});
export type ClientStatusReportOutput = z.infer<typeof ClientStatusReportOutputSchema>;

const clientReportPrompt = ai.definePrompt({
  name: 'clientReportPrompt',
  input: {schema: ClientStatusReportInputSchema},
  output: {schema: ClientStatusReportOutputSchema},
  prompt: `You are an elite Project Management Consultant for a high-growth startup. 
  
Generate a professional, encouraging, and clear status update for our client based on the following project data:

Project: {{{projectTitle}}}
Client: {{{customerName}}}
Current Progress: {{{progress}}}%
Budget: {{{budget}}}
Due Date: {{{dueDate}}}
Status: {{{status}}}

Your tone should be professional, transparent, and proactive. If progress is low relative to the due date, be honest but provide clear next steps.

{{jsonSchema output.schema}}`,
});

const clientStatusReportFlow = ai.defineFlow(
  {
    name: 'clientStatusReportFlow',
    inputSchema: ClientStatusReportInputSchema,
    outputSchema: ClientStatusReportOutputSchema,
  },
  async (input) => {
    const {output} = await clientReportPrompt(input);
    if (!output) throw new Error('Failed to generate client status report.');
    return output;
  }
);

export async function generateClientStatusReport(input: ClientStatusReportInput): Promise<ClientStatusReportOutput> {
  return clientStatusReportFlow(input);
}
