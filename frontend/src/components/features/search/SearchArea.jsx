import { memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchForm } from './SearchForm.jsx';
import { SearchResultsPanel } from './SearchResultsPanel.jsx';

export function SearchArea() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();

  return (
    <section>
      <SearchHeading />
      <SearchForm />
      <SearchResultsPanel query={q} />
    </section>
  );
}

const SearchHeading = memo(function SearchHeading() {
  return (
    <div style={{ borderLeft: '4px solid #cc0000', paddingLeft: 12, marginBottom: '1.25rem' }}>
      <h1 style={{ color: '#cc0000', fontSize: 14, letterSpacing: 3 }}>POKÉMON SEARCH</h1>
      <p style={{ color: '#666', fontSize: 8, marginTop: 4 }}>POWERED BY POKEAPI.CO</p>
    </div>
  );
});
