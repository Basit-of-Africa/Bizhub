'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting transaction data from receipts or invoices.
 *
 * - processInvoice - A function that analyzes an image of a receipt to extract financial data.
 * - ProcessInvoiceInput - The input type (image as data URI).
 * - ProcessInvoiceOutput - The extracted transaction details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessInvoiceInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a receipt or invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ProcessInvoiceInput = z.infer<typeof ProcessInvoiceInputSchema>;

const ProcessInvoiceOutputSchema = z.object({
  description: z.string().describe('The name of the vendor or a short description of the purchase.'),
  amount: z.number().positive().describe('The total amount found on the receipt.'),
  date: z.string().describe('The date of the transaction in ISO format (YYYY-MM-DD). Defaults to today if not found.'),
  category: z.string().describe('The most likely budget category (e.g., Software, Rent, Marketing, Utilities).'),
  type: z.enum(['income', 'expense']).default('expense').describe('Whether this is an income or expense.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the extraction.'),
});
export type ProcessInvoiceOutput = z.infer<typeof ProcessInvoiceOutputSchema>;

const invoicePrompt = ai.definePrompt({
  name: 'invoicePrompt',
  input: {schema: ProcessInvoiceInputSchema},
  output: {schema: ProcessInvoiceOutputSchema},
  prompt: `You are an expert accountant. Analyze the provided receipt or invoice image.
  
Extract the following information:
1. Vendor/Description (e.g., "Amazon", "Starbucks", "Office Depot")
2. Total Amount
3. Transaction Date (format as YYYY-MM-DD)
4. Expense Category (one of: Software, Utilities, Office Supplies, Rent, Marketing, Client Project, Consulting)

If the image is an invoice issued BY the business (showing them as the biller), mark the type as "income". Otherwise, default to "expense".

Photo: {{media url=photoDataUri}}

{{jsonSchema output.schema}}`,
});

const processInvoiceFlow = ai.defineFlow(
  {
    name: 'processInvoiceFlow',
    inputSchema: ProcessInvoiceInputSchema,
    outputSchema: ProcessInvoiceOutputSchema,
  },
  async (input) => {
    const {output} = await invoicePrompt(input);
    if (!output) throw new Error('Failed to extract data from the receipt.');
    return output;
  }
);

export async function processInvoice(input: ProcessInvoiceInput): Promise<ProcessInvoiceOutput> {
  return processInvoiceFlow(input);
}
