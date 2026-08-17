import { getFolderStudents } from '@/lib/resultStudents';
import { getManagedResults } from '@/lib/results';
import { ResultsClient } from './ResultsClient';

export default async function ResultsPage() {
  const [wp, folder] = await Promise.all([getManagedResults(), getFolderStudents()]);

  return (
    <ResultsClient
      rajasthanPolice={wp.rajasthanPolice.length > 0 ? wp.rajasthanPolice : folder.rajasthanPolice}
      reet={wp.reet.length > 0 ? wp.reet : folder.reet}
    />
  );
}
