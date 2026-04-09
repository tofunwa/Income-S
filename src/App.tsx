import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Theme } from './settings/types';
import { CompanyTransactionList } from './components/generated/CompanyTransactionList';
// %IMPORT_STATEMENT

let theme: Theme = 'light';
// only use 'centered' container for standalone components, never for full page apps or websites.
let container: Container = 'centered';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  const generatedComponent = useMemo(() => {
    // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CompanyTransactionList />} />
          <Route path="/settings" element={<CompanyTransactionList />} />
          <Route path="/help" element={<CompanyTransactionList />} />
        </Routes>
      </BrowserRouter>
    );
  }, []);

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return generatedComponent;
  }
}

export default App;
