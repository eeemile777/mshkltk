import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS, CATEGORIES } from '../constants';
import { FaUsers, FaLandmark } from 'react-icons/fa6';
import { ReportCategory } from '../types';

const BackgroundAnims = () => {
  const { theme } = React.useContext(AppContext);

  const floatingIcons = React.useMemo(() => {
    const iconKeys: ReportCategory[] = Object.keys(CATEGORIES) as ReportCategory[];
    return Array.from({ length: 40 }).map((_, i) => {
      const categoryKey = iconKeys[i % iconKeys.length];
      const category = CATEGORIES[categoryKey];
      const Icon = category.icon;
      
      return {
        id: i,
        Icon: Icon,
        color: theme === 'dark' ? category.color.dark : category.color.light,
        style: {
          top: `${5 + Math.random() * 90}%`,
          left: `${5 + Math.random() * 90}%`,
          animationDuration: `${25 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 15}s`,
          transform: `scale(${0.5 + Math.random() * 0.8})`,
        },
        size: 30 + Math.random() * 50,
      };
    });
  }, [theme]);
  
  const maskStyle: React.CSSProperties = {
    maskImage: 'radial-gradient(circle at center, transparent 0%, transparent 20%, black 40%)',
    WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, transparent 20%, black 40%)',
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={maskStyle}>
      {floatingIcons.map(({ id, Icon, color, style, size }) => (
        <div key={id} className="absolute animate-float-subtle" style={style}>
          <Icon style={{ color }} className="opacity-50" size={size} />
        </div>
      ))}
    </div>
  );
};


const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isReverseAnimating, setIsReverseAnimating] = React.useState(
        location.state?.reverseAnimation || false
    );

    const handlePress = () => {
        if (isAnimating || isReverseAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            navigate(PATHS.AUTH_LOGIN);
        }, 1500); // Match animation duration
    };

    React.useEffect(() => {
        if (isReverseAnimating) {
            const timer = setTimeout(() => {
                setIsReverseAnimating(false);
                navigate('.', { replace: true, state: {} });
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isReverseAnimating, navigate]);

    const animationState: 'idle' | 'forward' | 'reverse' = isAnimating
        ? 'forward'
        : isReverseAnimating
        ? 'reverse'
        : 'idle';
    
    const logoClasses = {
        idle: 'animate-logo-pulse',
        forward: 'animate-fade-out-slow',
        reverse: 'animate-logo-fade-in'
    }[animationState];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-sand dark:bg-bg-dark p-4 overflow-hidden">
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${animationState === 'forward' ? 'opacity-0' : 'opacity-100'}`}>
              <BackgroundAnims />
            </div>

            <button
                onClick={handlePress}
                disabled={animationState !== 'idle'}
                className="relative z-10 flex flex-col items-center justify-center focus:outline-none"
                aria-label="Enter Mshkltk"
            >
                <div className={`text-center transition-all duration-500 ${logoClasses}`}>
                    <h1 className="text-7xl sm:text-9xl font-bold font-display text-mango tracking-wide">Mshkltk</h1>
                    <h2 className="text-7xl sm:text-9xl font-bold font-arabic text-coral -mt-4 sm:-mt-6">مشكلتك</h2>
                </div>
                
                {(animationState === 'forward' || animationState === 'reverse') && (
                    <>
                        <div className={`absolute ${animationState === 'forward' ? 'animate-icon-emerge-left' : 'animate-icon-merge-left'}`}>
                            <span className="text-9xl text-teal"><FaUsers/></span>
                        </div>
                        <div className={`absolute ${animationState === 'forward' ? 'animate-icon-emerge-right' : 'animate-icon-merge-right'}`}>
                            <span className="text-9xl text-sky"><FaLandmark/></span>
                        </div>
                    </>
                )}
            </button>
        </div>
    );
};

export default LandingPage;