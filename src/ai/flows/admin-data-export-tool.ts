'use server';

/**
 * @fileOverview A tool to export student data in Excel format, filtered to show either the top 3 students from each school or all student data.
 *
 * - adminDataExportTool - A function that handles the exporting of student data.
 * - AdminDataExportToolInput - The input type for the adminDataExportTool function.
 * - AdminDataExportToolOutput - The return type for the adminDataExportTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminDataExportToolInputSchema = z.object({
  filterType: z
    .enum(['top3', 'all'])
    .describe("The type of filter to apply to the student data.  'top3' for top 3 students from each school, 'all' for all student data."),
});

export type AdminDataExportToolInput = z.infer<typeof AdminDataExportToolInputSchema>;

const AdminDataExportToolOutputSchema = z.object({
  excelData: z
    .string()
    .describe('The student data in base64 encoded Excel format.'),
});

export type AdminDataExportToolOutput = z.infer<typeof AdminDataExportToolOutputSchema>;

export async function adminDataExportTool(input: AdminDataExportToolInput): Promise<AdminDataExportToolOutput> {
  return adminDataExportToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminDataExportToolPrompt',
  input: {schema: AdminDataExportToolInputSchema},
  output: {schema: AdminDataExportToolOutputSchema},
  prompt: `You are an expert data analyst.  You will receive a request to export student data, filtered in a certain way, and you will return the data in Excel format.

The filter type is: {{{filterType}}}

Return the data in base64 encoded Excel format.
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const adminDataExportToolFlow = ai.defineFlow(
  {
    name: 'adminDataExportToolFlow',
    inputSchema: AdminDataExportToolInputSchema,
    outputSchema: AdminDataExportToolOutputSchema,
  },
  async input => {
    // TODO: Implement the logic to fetch data from Firebase and convert it to Excel format based on the filter type.
    // This is a placeholder, replace it with actual implementation.

    //For the sake of example return a hardcoded base64 encoded string for an Excel file.
    const exampleExcelData = 'SGVsbG8gV29ybGQh';

    const {output} = await prompt(input);
    return {
      excelData: exampleExcelData,
    };
  }
);
