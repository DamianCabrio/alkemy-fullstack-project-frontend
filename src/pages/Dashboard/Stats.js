import { useEffect } from 'react';
import { useAppContext } from '../../contexts/app/appContext';
import { StatsContainer, Loading, ChartsContainer } from '../../components';

function Stats() {
  const { fetchTransactionStats, isLoading, transactionStats, token } =
    useAppContext();

  useEffect(() => {
    if (token) {
      fetchTransactionStats();
    }
  }, [fetchTransactionStats, token]);

  if (isLoading) {
    return <Loading center />;
  }

  return (
    <>
      <StatsContainer />
      {transactionStats?.groupByLastSixMonths.length > 0 && <ChartsContainer />}
    </>
  );
}
export default Stats;
