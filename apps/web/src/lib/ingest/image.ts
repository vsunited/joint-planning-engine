import { IngestedDocument } from './types';

/**
 * Images carry no text layer by definition, so they go straight to a vision
 * model. Read as a data URI for the OpenAI-compatible content array.
 */
export async function ingestImage(file: File): Promise<Partial<IngestedDocument>> {
  const dataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });

  return {
    text: '',
    charCount: 0,
    status: 'needs_vision',
    images: [dataUri],
    pageCount: 1,
    detail: 'Image uploaded. A vision model is needed to read the text it contains.',
  };
}
