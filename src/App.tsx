// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { careerData } from './data/careerData';
import Planet from './components/Planet';

interface Position {
  x: number;
  y: number;
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<{ industry: string; field: string } | null>(null);

  const industries = careerData.industries;
  const hub = careerData.hub;

  const centerX = 50;
  const centerY = 50;
  const industryRadius = 36;
  const angleStep = 360 / industries.length;

  const planetPositions = useRef<Map<string, Position>>(new Map());

  useEffect(() => {
    // Floating handled in Planet component
  }, [expandedIndustry, expandedField]);

  // Handle industry click
  const handleIndustryClick = (name: string) => {
    if (expandedIndustry === name) {
      setExpandedIndustry(null);
      setExpandedField(null);
    } else {
      setExpandedIndustry(name);
      setExpandedField(null);
    }
  };

  // Handle field click
  const handleFieldClick = (industryName: string, fieldName: string) => {
    if (expandedField?.industry === industryName && expandedField?.field === fieldName) {
      setExpandedField(null);
    } else {
      setExpandedField({ industry: industryName, field: fieldName });
    }
  };

  const getParentPos = (parentName: string): Position => {
    if (parentName === hub.name) return { x: centerX, y: centerY };
    const pos = planetPositions.current.get(parentName);
    return pos || { x: centerX, y: centerY };
  };

  const renderPlanets = () => {
    const elements: JSX.Element[] = [];

    // First, render all industry → hub lines
    industries.forEach((industry, index) => {
      const angleRad = (index * angleStep) * (Math.PI / 180);
      let x = centerX + industryRadius * Math.cos(angleRad);
      let y = centerY + industryRadius * Math.sin(angleRad);

      // Push away logic
      if (expandedIndustry && expandedIndustry !== industry.name) {
        const expandedIndex = industries.findIndex(ind => ind.name === expandedIndustry);
        const expandedAngleRad = (expandedIndex * angleStep) * (Math.PI / 180);
        const expandedX = centerX + industryRadius * Math.cos(expandedAngleRad);
        const expandedY = centerY + industryRadius * Math.sin(expandedAngleRad);

        const dx = x - expandedX;
        const dy = y - expandedY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const maxPush = 18;
        const minDistance = 25;
        const pushAmount = distance < minDistance ? maxPush : maxPush * (minDistance / distance);

        x += pushAmount * Math.cos(angle);
        y += pushAmount * Math.sin(angle);
      }

      planetPositions.current.set(industry.name, { x, y });

      // Hub → Industry connection line
      elements.push(
        <svg
          key={`line-hub-${industry.name}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ left: 0, top: 0, zIndex: 5 }}
        >
          <path
            d={`M ${centerX}vw ${centerY}vh L ${x}vw ${y}vh`}
            stroke={`${industry.color}40`}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ 
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>
      );
    });

    // Now render industry planets and their fields/jobs
    industries.forEach((industry, index) => {
      const angleRad = (index * angleStep) * (Math.PI / 180);
      let x = centerX + industryRadius * Math.cos(angleRad);
      let y = centerY + industryRadius * Math.sin(angleRad);

      // Push away logic (same as above)
      if (expandedIndustry && expandedIndustry !== industry.name) {
        const expandedIndex = industries.findIndex(ind => ind.name === expandedIndustry);
        const expandedAngleRad = (expandedIndex * angleStep) * (Math.PI / 180);
        const expandedX = centerX + industryRadius * Math.cos(expandedAngleRad);
        const expandedY = centerY + industryRadius * Math.sin(expandedAngleRad);

        const dx = x - expandedX;
        const dy = y - expandedY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const maxPush = 18;
        const minDistance = 25;
        const pushAmount = distance < minDistance ? maxPush : maxPush * (minDistance / distance);

        x += pushAmount * Math.cos(angle);
        y += pushAmount * Math.sin(angle);
      }

      const isIndustryExpanded = expandedIndustry === industry.name;

      // Industry planet - WITH RING
      elements.push(
        <Planet
          key={industry.name}
          name={industry.name}
          color={industry.color}
          size="lg"
          hasRing={true} // Industry planets have rings
          onClick={() => handleIndustryClick(industry.name)}
          className="group"
          style={{
            position: 'absolute',
            left: `${x}vw`,
            top: `${y}vh`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            zIndex: isIndustryExpanded ? 25 : 20,
          }}
        />
      );

      // Fields
      if (isIndustryExpanded) {
        const fieldRadius = 14;
        const fieldAngleStep = 360 / industry.fields.length;

        industry.fields.forEach((field, fIndex) => {
          const fAngleRad = (fIndex * fieldAngleStep) * (Math.PI / 180);
          const parentPos = getParentPos(industry.name);
          const fx = parentPos.x + fieldRadius * Math.cos(fAngleRad);
          const fy = parentPos.y + fieldRadius * Math.sin(fAngleRad);

          const isFieldExpanded = 
            expandedField?.industry === industry.name && 
            expandedField?.field === field.name;

          // Field planet - NO RING
          elements.push(
            <Planet
              key={`${industry.name}-${field.name}`}
              name={field.name}
              color={industry.color}
              size="md"
              hasRing={false} // Field planets don't have rings
              onClick={() => handleFieldClick(industry.name, field.name)}
              className="group field-planet"
              style={{
                position: 'absolute',
                left: `${fx}vw`,
                top: `${fy}vh`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isFieldExpanded ? 35 : 30,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 1,
              }}
            />
          );

          // Field → Industry line
          const startPos = getParentPos(industry.name);
          const endPos = { x: fx, y: fy };
          elements.push(
            <svg
              key={`line-field-${industry.name}-${field.name}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ left: 0, top: 0, zIndex: 15 }}
            >
              <path
                d={`M ${startPos.x}vw ${startPos.y}vh L ${endPos.x}vw ${endPos.y}vh`}
                stroke={`${industry.color}50`}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                style={{ 
                  filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.3))',
                  transition: 'all 0.5s ease-out'
                }}
              />
            </svg>
          );

          // Jobs - if this field is expanded
          if (isFieldExpanded) {
            const jobRadius = 8;
            const jobAngleStep = 360 / field.jobs.length;

            field.jobs.forEach((job, jIndex) => {
              const jAngleRad = (jIndex * jobAngleStep) * (Math.PI / 180);
              const jobParentPos = { x: fx, y: fy };
              const jx = jobParentPos.x + jobRadius * Math.cos(jAngleRad);
              const jy = jobParentPos.y + jobRadius * Math.sin(jAngleRad);

              // Job planet - NO RING
              elements.push(
                <Planet
                  key={`${industry.name}-${field.name}-${job.name}`}
                  name={job.name}
                  color={industry.color}
                  size="sm"
                  hasRing={false} // Job planets don't have rings
                  className="group job-planet"
                  style={{
                    position: 'absolute',
                    left: `${jx}vw`,
                    top: `${jy}vh`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'default',
                    zIndex: 40,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: 1,
                  }}
                />
              );

              // Field → Job line
              const jobStart = { x: fx, y: fy };
              const jobEnd = { x: jx, y: jy };
              elements.push(
                <svg
                  key={`line-job-${industry.name}-${field.name}-${job.name}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ left: 0, top: 0, zIndex: 15 }}
                >
                  <path
                    d={`M ${jobStart.x}vw ${jobStart.y}vh L ${jobEnd.x}vw ${jobEnd.y}vh`}
                    stroke={`${industry.color}40`}
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                    style={{ 
                      filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.2))',
                      transition: 'all 0.4s ease-out'
                    }}
                  />
                </svg>
              );
            });
          }
        });
      }
    });

    return elements;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden text-white"
      style={{ perspective: '1800px' }}
    >
      {/* Nebula background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a001a]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, #6b00ff 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, #ff00aa 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, #00d4ff 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, #4d00b3 10%, transparent 50%), radial-gradient(circle at 80% 70%, #330066 10%, transparent 60%)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(white 1px, transparent 1px), radial-gradient(white 0.8px, transparent 0.8px)',
            backgroundSize: '80px 80px, 50px 50px',
            backgroundPosition: '0 0, 30px 30px',
            opacity: 0.25,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Top Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-cyan-300">Sign in to your own program,</div>
          <div className="text-gray-300">or start from scratch</div>
        </div>
      </div>

      <button className="absolute top-6 right-6 px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-medium transition-all z-50 shadow-lg">
        SIGN UP
      </button>

      {/* Orbit circle around hub */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ left: 0, top: 0, zIndex: 5 }}
      >
        <circle
          cx={`${centerX}vw`}
          cy={`${centerY}vh`}
          r={`${industryRadius}vw`}
          fill="none"
          stroke="rgba(100, 150, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Central hub - NO RING */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <Planet
          name={hub.name}
          color="#ffffff"
          size="lg"
          hasRing={false} // Hub doesn't have a ring
          className="group"
          style={{}}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-xs font-semibold text-white/80 tracking-wider uppercase">
            AI Connected
          </div>
          <div className="text-sm font-bold text-white tracking-wide uppercase">
            Career Pathways
          </div>
        </div>
      </div>

      {renderPlanets()}

      {/* Bottom help icons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg">
          <span className="text-white text-lg">?</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Bottom left X button */}
      <button className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all z-50 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Reset button */}
      {expandedIndustry && (
        <button
          className="absolute top-20 right-6 px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-50 backdrop-blur-sm"
          onClick={() => {
            setExpandedIndustry(null);
            setExpandedField(null);
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default App;