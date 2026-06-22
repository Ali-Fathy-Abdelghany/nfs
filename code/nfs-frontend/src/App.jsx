import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '20px' }}>
        <p>NFS</p>
      </main>

      <Footer />
    </div>
  );
}

export default App;