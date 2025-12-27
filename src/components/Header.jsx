import { Users} from 'lucide-react';
import styles from '../styles';

const Header = () => (
  <header style={styles.header}>
    <h1 style={styles.title}>
      <Users size={32} />
      Galois-Field Stadium Simulation
    </h1>
    <p style={styles.subtitle}>Modelling and Simulation • TU Wien</p>
  </header>
);
export default Header;