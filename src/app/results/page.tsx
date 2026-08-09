import { getFolderStudents } from '@/lib/resultStudents';
import { ResultsClient } from './ResultsClient';

export default function ResultsPage() {
  const { rajasthanPolice, reet } = getFolderStudents();

  return <ResultsClient rajasthanPolice={rajasthanPolice} reet={reet} />;
}
