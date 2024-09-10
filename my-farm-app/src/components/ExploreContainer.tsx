import './ExploreContainer.css';
import QRScanner from './QRScanner';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div id="container">
      <strong>Ready to create an app?</strong>
      <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
      <h1>My Farm App</h1>
      <QRScanner />
    </div>
  );
};

export default ExploreContainer;
