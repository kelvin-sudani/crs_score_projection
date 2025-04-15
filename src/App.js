import React, { useState, useEffect } from 'react';
import ScoreLineChart from './ScoreLineChart';

// --- UI Components (remain the same) ---
const Card = ({ className, children }) => <div className={`border rounded-lg p-4 shadow-sm bg-white ${className}`}>{children}</div>;
const CardHeader = ({ className, children }) => <div className={`mb-4 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ className, children }) => <div className={`space-y-4 ${className}`}>{children}</div>;
const Label = ({ htmlFor, children, className }) => <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>;
const Select = ({ id, value, onChange, children, className }) => (
  <select id={id} value={value} onChange={onChange} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border ${className}`}>
    {children}
  </select>
);
const Input = ({ id, type, value, onChange, min, max, className }) => (
   <input type={type} id={id} value={value} onChange={onChange} min={min} max={max} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`} />
);
const RadioGroup = ({ children, className }) => (
  <div className={`flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 ${className || ''}`}>
    {children}
  </div>
);
const RadioGroupItem = ({ id, value, name, checked, onChange, children, disabled }) => (
    <div className="flex items-center gap-2 min-h-[2.5rem]">
        <input id={id} name={name} type="radio" value={value} checked={checked} onChange={onChange} disabled={disabled} className={`focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
        <label htmlFor={id} className={`block text-sm font-medium cursor-pointer select-none ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>{children}</label>
    </div>
);
const Separator = () => <hr className="my-6 border-gray-200" />;
const Button = ({ onClick, children, isActive }) => ( <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${ isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300' }`} > {children} </button> );

// --- CRS Points Logic (Revised based on Snippet & CRS Rules) ---

const safeParseInt = (value, defaultValue = 0) => { if (value === '' || value === null || value === undefined) return defaultValue; const parsed = parseInt(value, 10); return isNaN(parsed) ? defaultValue : parsed; };

// A1. Age Points (Validated against Snippet Logic)
const getAgePoints = (age, hasSpouse) => {
  const ageMap = [ { ageMin: 0, ageMax: 17, spouse: 0, noSpouse: 0 }, { ageMin: 18, ageMax: 18, spouse: 90, noSpouse: 99 }, { ageMin: 19, ageMax: 19, spouse: 95, noSpouse: 105 }, { ageMin: 20, ageMax: 29, spouse: 100, noSpouse: 110 }, { ageMin: 30, ageMax: 30, spouse: 95, noSpouse: 105 }, { ageMin: 31, ageMax: 31, spouse: 90, noSpouse: 99 }, { ageMin: 32, ageMax: 32, spouse: 85, noSpouse: 94 }, { ageMin: 33, ageMax: 33, spouse: 80, noSpouse: 88 }, { ageMin: 34, ageMax: 34, spouse: 75, noSpouse: 83 }, { ageMin: 35, ageMax: 35, spouse: 70, noSpouse: 77 }, { ageMin: 36, ageMax: 36, spouse: 65, noSpouse: 72 }, { ageMin: 37, ageMax: 37, spouse: 60, noSpouse: 66 }, { ageMin: 38, ageMax: 38, spouse: 55, noSpouse: 61 }, { ageMin: 39, ageMax: 39, spouse: 50, noSpouse: 55 }, { ageMin: 40, ageMax: 40, spouse: 45, noSpouse: 50 }, { ageMin: 41, ageMax: 41, spouse: 35, noSpouse: 39 }, { ageMin: 42, ageMax: 42, spouse: 25, noSpouse: 28 }, { ageMin: 43, ageMax: 43, spouse: 15, noSpouse: 17 }, { ageMin: 44, ageMax: 44, spouse: 5, noSpouse: 6 }, { ageMin: 45, ageMax: 999, spouse: 0, noSpouse: 0 }, ];
  const ageNum = safeParseInt(age); const pointsInfo = ageMap.find(item => ageNum >= item.ageMin && ageNum <= item.ageMax); if (!pointsInfo) return 0; return hasSpouse ? pointsInfo.spouse : pointsInfo.noSpouse;
};

// A2. Education Points (Validated against Snippet Logic)
const getEducationPoints = (level, hasSpouse) => {
  const pointsMap = { none: { spouse: 0, noSpouse: 0 }, secondary: { spouse: 28, noSpouse: 30 }, one_year_diploma: { spouse: 84, noSpouse: 90 }, two_year_diploma: { spouse: 91, noSpouse: 98 }, bachelor: { spouse: 112, noSpouse: 120 }, two_or_more_certs: { spouse: 119, noSpouse: 128 }, master: { spouse: 126, noSpouse: 135 }, phd: { spouse: 140, noSpouse: 150 }, };
  const pointsInfo = pointsMap[level]; if (!pointsInfo) return 0; return hasSpouse ? pointsInfo.spouse : pointsInfo.noSpouse;
};

// Helper for Language Points based on CLB (Validated against Snippet Logic)
const getPointsForCLB = (clbLevel, isFirstLang, isSpousePoints, hasSpouse) => {
    const clb = safeParseInt(clbLevel, 0);
    if (isSpousePoints) { if (clb >= 9) return 5; if (clb >= 7) return 3; if (clb >= 5) return 1; return 0; }
    if (isFirstLang) { if (clb >= 10) return hasSpouse ? 32 : 34; if (clb === 9) return hasSpouse ? 29 : 31; if (clb === 8) return hasSpouse ? 22 : 23; if (clb === 7) return hasSpouse ? 16 : 17; if (clb === 6) return hasSpouse ? 8 : 9; if (clb >= 4) return 6; return 0; }
    else { if (clb >= 9) return 6; if (clb >= 7) return 3; if (clb >= 5) return 1; return 0; } // Second Language
};

// A3. First Official Language Points (Uses Validated Helper)
const getFirstLanguagePoints = (langScores, hasSpouse) => { let totalPoints = 0; ['r', 'w', 'l', 's'].forEach(ability => { totalPoints += getPointsForCLB(langScores[`clb_${ability}`], true, false, hasSpouse); }); return Math.min(totalPoints, hasSpouse ? 128 : 136); };

// A3. Second Official Language Points (Uses Validated Helper)
const getSecondLanguagePoints = (langScores, hasSpouse) => { let totalPoints = 0; ['r', 'w', 'l', 's'].forEach(ability => { totalPoints += getPointsForCLB(langScores[`nclc_${ability}`], false, false, hasSpouse); }); return Math.min(totalPoints, hasSpouse ? 22 : 24); };

// A4. Canadian Work Experience Points (Validated against Snippet Logic)
const getCanadianWorkExperiencePoints = (years, hasSpouse) => {
  const yearsNum = safeParseInt(years); const pointsMap = { '0': { spouse: 0, noSpouse: 0 }, '1': { spouse: 35, noSpouse: 40 }, '2': { spouse: 46, noSpouse: 53 }, '3': { spouse: 56, noSpouse: 64 }, '4': { spouse: 63, noSpouse: 72 }, '5': { spouse: 70, noSpouse: 80 }, };
  const pointsInfo = pointsMap[yearsNum.toString()]; if (!pointsInfo) return 0; return hasSpouse ? pointsInfo.spouse : pointsInfo.noSpouse;
};

// --- B. Spouse Factors Points (Validated against Snippet Logic) ---
const getSpouseEducationPoints = (level) => { const pointsMap = { none: 0, secondary: 2, one_year_diploma: 6, two_year_diploma: 7, bachelor: 8, two_or_more_certs: 9, master: 10, phd: 10 }; return pointsMap[level] || 0; };
const getSpouseLanguagePoints = (langScores) => { let totalPoints = 0; ['r', 'w', 'l', 's'].forEach(ability => { totalPoints += getPointsForCLB(langScores[`spouse_clb_${ability}`], false, true, true); }); return Math.min(totalPoints, 20); };
const getSpouseCanadianWorkExperiencePoints = (years) => { const yearsNum = safeParseInt(years); const pointsMap = { 0: 0, 1: 5, 2: 7, 3: 8, 4: 9, 5: 10 }; return pointsMap[yearsNum] !== undefined ? pointsMap[yearsNum] : (yearsNum >= 5 ? 10 : 0); };

// --- C. Skill Transferability Factors (Revised Logic based on Official Structure) ---
const getSkillTransferabilityPoints = (formData) => {
    const { education, clb_r, clb_w, clb_l, clb_s, canadian_work_exp, foreign_work_exp, certificate_of_qualification } = formData;

    // Get CLB levels & check if all are provided
    const clb_s_num = safeParseInt(clb_s, 0); const clb_l_num = safeParseInt(clb_l, 0); const clb_r_num = safeParseInt(clb_r, 0); const clb_w_num = safeParseInt(clb_w, 0);
    const allCLBProvided = clb_s_num > 0 && clb_l_num > 0 && clb_r_num > 0 && clb_w_num > 0;
    const minCLB = allCLBProvided ? Math.min(clb_s_num, clb_l_num, clb_r_num, clb_w_num) : 0;

    // Get other factors
    const eduLevel = education;
    const cweYears = safeParseInt(canadian_work_exp); // 0, 1, 2, 3, 4, 5
    const fweYearsCat = safeParseInt(foreign_work_exp); // 0, 1 (for 1-2), 3 (for 3+)
    const hasCoQ = certificate_of_qualification === 'yes';
    const hasPostSecondaryEdu = ['one_year_diploma', 'two_year_diploma', 'bachelor', 'two_or_more_certs', 'master', 'phd'].includes(eduLevel);

    // --- Calculate points for each of the 5 combinations, capping each at 50 ---

    // 1. Education + Language (Max 50)
    let eduLangPoints = 0;
    if (hasPostSecondaryEdu && allCLBProvided) {
        if (minCLB >= 9) eduLangPoints = 50;
        else if (minCLB >= 7) eduLangPoints = 25;
    }
    eduLangPoints = Math.min(eduLangPoints, 50); // Cap this combination

    // 2. Education + Canadian Work Experience (Max 50)
    let eduCWEPoints = 0;
    if (hasPostSecondaryEdu) {
        if (cweYears >= 2) eduCWEPoints = 50;
        else if (cweYears === 1) eduCWEPoints = 25;
    }
    eduCWEPoints = Math.min(eduCWEPoints, 50); // Cap this combination

    // 3. Foreign Work Experience + Language (Max 50)
    let fweLangPoints = 0;
    if (allCLBProvided) {
        if (fweYearsCat === 1) { // 1-2 years FWE
             if (minCLB >= 9) fweLangPoints = 25; else if (minCLB >= 7) fweLangPoints = 13;
        } else if (fweYearsCat >= 3) { // 3+ years FWE
             if (minCLB >= 9) fweLangPoints = 50; else if (minCLB >= 7) fweLangPoints = 25;
        }
    }
    fweLangPoints = Math.min(fweLangPoints, 50); // Cap this combination

    // 4. Foreign Work Experience + Canadian Work Experience (Max 50)
    let fweCWEPoints = 0;
    if (fweYearsCat === 1) { // 1-2 years FWE
         if (cweYears >= 2) fweCWEPoints = 25; else if (cweYears === 1) fweCWEPoints = 13;
    } else if (fweYearsCat >= 3) { // 3+ years FWE
         if (cweYears >= 2) fweCWEPoints = 50; else if (cweYears === 1) fweCWEPoints = 25;
    }
    fweCWEPoints = Math.min(fweCWEPoints, 50); // Cap this combination

     // 5. Certificate of Qualification + Language (Max 50)
     let coqLangPoints = 0;
     if (hasCoQ && allCLBProvided) {
         // Use minCLB calculated earlier which requires all scores > 0
         if (minCLB >= 7) coqLangPoints = 50;
         else if (minCLB >= 5) coqLangPoints = 25;
     }
     coqLangPoints = Math.min(coqLangPoints, 50); // Cap this combination

    // --- Total Skill Factors ---
    // Sum the capped points from the 5 combinations
    let skill_factors = eduLangPoints + eduCWEPoints + fweLangPoints + fweCWEPoints + coqLangPoints;

    // Overall Cap for Skill Transferability section
    return Math.min(skill_factors, 100);
};

// --- D. Additional Points (Revised Logic) ---
const getAdditionalPoints = (formData) => {
  let points = 0;
  const { provincial_nomination, job_offer, canadian_study_level, sibling_in_canada, french_nclc7_all, clb_r, clb_w, clb_l, clb_s } = formData;

  // Provincial Nomination
  if (provincial_nomination === 'yes') points += 600;

  // Valid Job Offer (Implementing based on rules)
  if (job_offer === 'yes_noc_00') points += 200;
  else if (job_offer === 'yes_noc_other') points += 50;

  // Canadian Study Experience
  if (canadian_study_level === '1_or_2_years') points += 15;
  else if (canadian_study_level === '3_years_or_more') points += 30;

  // Sibling in Canada
  if (sibling_in_canada === 'yes') points += 15;

  // French Language Skills Bonus (Validated Logic)
  // french_nclc7_all is auto-calculated based on individual NCLC scores
  if (french_nclc7_all === 'yes') {
       const clb_s_num = safeParseInt(clb_s, 0); const clb_l_num = safeParseInt(clb_l, 0); const clb_r_num = safeParseInt(clb_r, 0); const clb_w_num = safeParseInt(clb_w, 0);
       const anyEnglishScore = clb_s_num > 0 || clb_l_num > 0 || clb_r_num > 0 || clb_w_num > 0;

       if (anyEnglishScore) {
           const minEnglishCLB = Math.min(clb_s_num || 99, clb_l_num || 99, clb_r_num || 99, clb_w_num || 99);
           if (minEnglishCLB >= 5) { points += 50; } // NCLC 7+ and CLB 5+
           else { points += 25; } // NCLC 7+ and CLB 4 or less
       } else {
           points += 25; // NCLC 7+ and no English test
       }
  }

  // Overall Cap for Additional Points section
  return Math.min(points, 600);
};

// --- Main Score Calculation Function (Uses updated helpers) ---
const calculateAllScores = (data, ageOverride = null, cweYearsOverride = null) => {
    const hasSpouse = data.marital_status === 'married';
    const ageForCalc = ageOverride !== null ? ageOverride.toString() : data.age;
    const cweYearsValueForCalc = cweYearsOverride !== null ? Math.min(cweYearsOverride, 5).toString() : data.canadian_work_exp;
    let corePoints = 0; corePoints += getAgePoints(ageForCalc, hasSpouse); corePoints += getEducationPoints(data.education, hasSpouse); corePoints += getFirstLanguagePoints(data, hasSpouse); corePoints += getSecondLanguagePoints(data, hasSpouse); corePoints += getCanadianWorkExperiencePoints(cweYearsValueForCalc, hasSpouse); const coreMax = hasSpouse ? 460 : 500; corePoints = Math.min(corePoints, coreMax);
    let spousePoints = 0; if (hasSpouse) { spousePoints += getSpouseEducationPoints(data.spouse_education); spousePoints += getSpouseLanguagePoints(data); spousePoints += getSpouseCanadianWorkExperiencePoints(data.spouse_canadian_work_exp); spousePoints = Math.min(spousePoints, 40); }
    const skillTransferabilityData = { ...data, canadian_work_exp: cweYearsValueForCalc }; const skillPoints = getSkillTransferabilityPoints(skillTransferabilityData); // Uses REVISED function
    const additionalPoints = getAdditionalPoints(data); // Uses REVISED function
    const totalScore = Math.min(corePoints + spousePoints + skillPoints + additionalPoints, 1200);
    return { core_human_capital: corePoints, spouse_factors: spousePoints, skill_transferability: skillPoints, additional_points: additionalPoints, total: totalScore };
};

// --- Helper functions for date calculations (remain the same) ---
const calculateAgeOnDate = (birthDateObj, targetDateObj) => { if (!birthDateObj || isNaN(birthDateObj.getTime())) return null; let age = targetDateObj.getFullYear() - birthDateObj.getFullYear(); const monthDiff = targetDateObj.getMonth() - birthDateObj.getMonth(); if (monthDiff < 0 || (monthDiff === 0 && targetDateObj.getDate() < birthDateObj.getDate())) { age--; } return age; };
const calculateCompletedCWEYears = (startDateObj, targetDateObj) => { if (!startDateObj || isNaN(startDateObj.getTime()) || targetDateObj < startDateObj) return 0; let years = targetDateObj.getFullYear() - startDateObj.getFullYear(); const monthDiff = targetDateObj.getMonth() - startDateObj.getMonth(); if (monthDiff < 0 || (monthDiff === 0 && targetDateObj.getDate() < startDateObj.getDate())) { years--; } return Math.max(0, years); };
const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };

// --- React App Component (State and Effects remain largely the same) ---
function App() {
  const [formData, setFormData] = useState({
    marital_status: 'single', age: '33', birthday: '', canadianWorkStartDate: '',
    education: 'master', clb_r: '10', clb_w: '10', clb_l: '10', clb_s: '10',
    nclc_r: '7', nclc_w: '7', nclc_l: '7', nclc_s: '7', canadian_work_exp: '1',
    foreign_work_exp: '3', certificate_of_qualification: 'no', spouse_education: 'none',
    spouse_clb_r: '', spouse_clb_w: '', spouse_clb_l: '', spouse_clb_s: '', spouse_canadian_work_exp: '0',
    provincial_nomination: 'no', job_offer: 'no', canadian_study_level: '1_or_2_years',
    sibling_in_canada: 'yes', french_nclc7_all: 'yes',
  });
  const [scores, setScores] = useState({ core_human_capital: 0, spouse_factors: 0, skill_transferability: 0, additional_points: 0, total: 0 });
  const [timelineProjections, setTimelineProjections] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const hasSpouse = formData.marital_status === 'married';

  // --- Handlers ---
  const handleInputChange = (e) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };
  const handleRadioChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  // --- Effect for Auto NCLC 7+ Check ---
  useEffect(() => {
    const { nclc_r, nclc_w, nclc_l, nclc_s } = formData; const scores = [nclc_r, nclc_w, nclc_l, nclc_s].map(s => safeParseInt(s, 0)); const allScoresPresent = scores.length === 4 && !scores.includes(0); const allNclc7Plus = allScoresPresent && scores.every(score => score >= 7); const newStatus = allNclc7Plus ? 'yes' : 'no'; if (newStatus !== formData.french_nclc7_all) { setFormData(prev => ({ ...prev, french_nclc7_all: newStatus })); }
  }, [formData.nclc_r, formData.nclc_w, formData.nclc_l, formData.nclc_s, formData.french_nclc7_all]);

  // --- Effect for Main Score Calculation ---
  useEffect(() => {
    // Uses the updated calculateAllScores function
    const currentScores = calculateAllScores(formData);
    setScores(currentScores);
  }, [formData]);

  // --- Effect for Timeline Score Projection Calculation ---
  useEffect(() => {
    const { birthday, canadianWorkStartDate } = formData;
    const birthDateObj = birthday ? new Date(birthday + 'T00:00:00') : null;
    const cweStartDateObj = canadianWorkStartDate ? new Date(canadianWorkStartDate + 'T00:00:00') : null;

    if (!birthDateObj || isNaN(birthDateObj.getTime()) || !cweStartDateObj || isNaN(cweStartDateObj.getTime())) { setTimelineProjections([]); return; }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allProjections = []; const numberOfYears = 5;

    const calculateProjectionsAroundDate = (eventDate, eventLabel) => {
        const datesToCalc = [ { date: addDays(eventDate, -1), label: `${eventLabel} -1d` }, { date: eventDate, label: `${eventLabel}` }, { date: addDays(eventDate, 1), label: `${eventLabel} +1d` }, ];
        datesToCalc.forEach(point => {
             if (point.date < today) return;
            const ageOnDate = calculateAgeOnDate(birthDateObj, point.date);
            const cweYearsOnDate = calculateCompletedCWEYears(cweStartDateObj, point.date);
            // Uses the updated calculateAllScores function with overrides
            const projectedScore = calculateAllScores(formData, ageOnDate, cweYearsOnDate);
            allProjections.push({ date: point.date, age: ageOnDate, cwe: cweYearsOnDate, score: projectedScore.total, label: point.label });
        });
    };

    // Calculate for Work Anniversaries
    const cweStartMonth = cweStartDateObj.getMonth(); const cweStartDay = cweStartDateObj.getDate(); let startYearAnniversary = today.getFullYear(); let firstAnniversaryDate = new Date(startYearAnniversary, cweStartMonth, cweStartDay); if (firstAnniversaryDate < today) { startYearAnniversary++; }
    for (let i = 0; i < numberOfYears; i++) { const targetYear = startYearAnniversary + i; const anniversaryDate = new Date(targetYear, cweStartMonth, cweStartDay); calculateProjectionsAroundDate(anniversaryDate, `Work Anniv. (Year ${calculateCompletedCWEYears(cweStartDateObj, anniversaryDate)})`); }

    // Calculate for Birthdays
    const birthMonth = birthDateObj.getMonth(); const birthDay = birthDateObj.getDate(); let startYearBirthday = today.getFullYear(); let firstBirthdayDate = new Date(startYearBirthday, birthMonth, birthDay); if (firstBirthdayDate < today) { startYearBirthday++; }
    for (let i = 0; i < numberOfYears; i++) { const targetYear = startYearBirthday + i; const birthdayDate = new Date(targetYear, birthMonth, birthDay); calculateProjectionsAroundDate(birthdayDate, `Birthday (Age ${calculateAgeOnDate(birthDateObj, birthdayDate)})`); }

    // Sort and filter projections
    allProjections.sort((a, b) => a.date - b.date);
    const uniqueProjections = allProjections.filter((item, index, self) => index === self.findIndex((t) => ( t.date.getTime() === item.date.getTime() )));
    setTimelineProjections(uniqueProjections);

  }, [formData]);

  // --- JSX Structure (Remains the same) ---
  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 font-sans overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">Unofficial CRS Score Estimator</h1>
      {/* Tab Navigation */}
      <div className="mb-6 flex justify-center space-x-4 border-b pb-2">
          <Button onClick={() => setActiveTab('calculator')} isActive={activeTab === 'calculator'}> Calculator </Button>
          <Button onClick={() => setActiveTab('projection')} isActive={activeTab === 'projection'}> Projection Timeline </Button>
      </div>
      {/* Conditional Content Based on Tab */}
      <div>
          {/* Calculator Tab Content */}
          {activeTab === 'calculator' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Input Column (Left) */}
                  <div className="md:col-span-2 space-y-6">
                      {/* Core Factors Card */}
                      <Card> <CardHeader><CardTitle>A. Core / Human Capital Factors</CardTitle></CardHeader> <CardContent> {/* Inputs excluding DOB/WorkStart */} <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <Label>Marital Status</Label> <RadioGroup className="flex space-x-4"> <RadioGroupItem id="marital_status-single" name="marital_status" value="single" checked={formData.marital_status === 'single'} onChange={handleRadioChange}>Single</RadioGroupItem> <RadioGroupItem id="marital_status-married" name="marital_status" value="married" checked={formData.marital_status === 'married'} onChange={handleRadioChange}>Married / Common-law</RadioGroupItem> </RadioGroup> </div> <div> <Label htmlFor="age">Current Age (for main score)</Label> <Input id="age" type="number" value={formData.age} onChange={handleInputChange} min="17" max="100" /> </div> </div> <div> <Label htmlFor="education">Level of Education</Label> <Select id="education" value={formData.education} onChange={handleInputChange}> <option value="none">None or less than secondary</option> <option value="secondary">Secondary diploma</option> <option value="one_year_diploma">One-year post-secondary</option> <option value="two_year_diploma">Two-year post-secondary</option> <option value="bachelor">Bachelor's degree (3+ yr)</option> <option value="two_or_more_certs">Two+ credentials (one 3+ yr)</option> <option value="master">Master's / Prof degree</option> <option value="phd">Doctoral level degree (PhD)</option> </Select> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div className="space-y-2 p-3 border rounded-md bg-gray-50"> <Label className="font-semibold">First Language (English CLB)</Label> <div className="grid grid-cols-2 gap-x-4 gap-y-2"> <div><Label htmlFor="clb_r">Reading</Label><Input id="clb_r" type="number" min="4" max="10" value={formData.clb_r} onChange={handleInputChange} /></div> <div><Label htmlFor="clb_w">Writing</Label><Input id="clb_w" type="number" min="4" max="10" value={formData.clb_w} onChange={handleInputChange} /></div> <div><Label htmlFor="clb_l">Listening</Label><Input id="clb_l" type="number" min="4" max="10" value={formData.clb_l} onChange={handleInputChange} /></div> <div><Label htmlFor="clb_s">Speaking</Label><Input id="clb_s" type="number" min="4" max="10" value={formData.clb_s} onChange={handleInputChange} /></div> </div> </div> <div className="space-y-2 p-3 border rounded-md bg-gray-50"> <Label className="font-semibold">Second Language (French NCLC)</Label> <div className="grid grid-cols-2 gap-x-4 gap-y-2"> <div><Label htmlFor="nclc_r">Reading</Label><Input id="nclc_r" type="number" min="4" max="10" value={formData.nclc_r} onChange={handleInputChange} /></div> <div><Label htmlFor="nclc_w">Writing</Label><Input id="nclc_w" type="number" min="4" max="10" value={formData.nclc_w} onChange={handleInputChange} /></div> <div><Label htmlFor="nclc_l">Listening</Label><Input id="nclc_l" type="number" min="4" max="10" value={formData.nclc_l} onChange={handleInputChange} /></div> <div><Label htmlFor="nclc_s">Speaking</Label><Input id="nclc_s" type="number" min="4" max="10" value={formData.nclc_s} onChange={handleInputChange} /></div> </div> </div> </div> <div> <Label htmlFor="canadian_work_exp">Canadian Work Experience (for main score)</Label> <Select id="canadian_work_exp" value={formData.canadian_work_exp} onChange={handleInputChange}> <option value="0">None or less than a year</option><option value="1">1 year</option><option value="2">2 years</option> <option value="3">3 years</option><option value="4">4 years</option><option value="5">5 years or more</option> </Select> <p className="text-xs text-gray-500 mt-1">Select completed years for main score calculation.</p> </div> </CardContent> </Card>
                      {/* Other Input Sections */}
                      {hasSpouse && ( <Card> <CardHeader><CardTitle>B. Spouse or Common-law Partner Factors</CardTitle></CardHeader> <CardContent> {/* Spouse fields... */} </CardContent> </Card> )}
                      <Card> <CardHeader><CardTitle>C. Skill Transferability Factors</CardTitle></CardHeader> <CardContent> {/* Skill Transferability fields... */} <div> <Label htmlFor="foreign_work_exp">Foreign Work Experience (in last 10 years)</Label> <Select id="foreign_work_exp" value={formData.foreign_work_exp} onChange={handleInputChange}> <option value="0">None or less than a year</option> <option value="1">1 or 2 years</option> <option value="3">3 years or more</option> </Select> </div> <div> <Label>Certificate of qualification (trade occupations)?</Label> <RadioGroup className="flex space-x-4"> <RadioGroupItem id="cert-no" name="certificate_of_qualification" value="no" checked={formData.certificate_of_qualification === 'no'} onChange={handleRadioChange}>No</RadioGroupItem> <RadioGroupItem id="cert-yes" name="certificate_of_qualification" value="yes" checked={formData.certificate_of_qualification === 'yes'} onChange={handleRadioChange}>Yes</RadioGroupItem> </RadioGroup> </div> </CardContent> </Card>
                      <Card> <CardHeader><CardTitle>D. Additional Points</CardTitle></CardHeader> <CardContent> {/* Additional Points fields... */} <div> <Label>Provincial Nomination?</Label> <RadioGroup className="flex space-x-4"> <RadioGroupItem id="pnp-no" name="provincial_nomination" value="no" checked={formData.provincial_nomination === 'no'} onChange={handleRadioChange}>No</RadioGroupItem> <RadioGroupItem id="pnp-yes" name="provincial_nomination" value="yes" checked={formData.provincial_nomination === 'yes'} onChange={handleRadioChange}>Yes (+600)</RadioGroupItem> </RadioGroup> </div> <div> <Label>Valid Job Offer?</Label> <Select id="job_offer" value={formData.job_offer} onChange={handleInputChange}> <option value="no">No</option> <option value="yes_noc_00">Yes (TEER 0 Major Group 00) (+200)</option> <option value="yes_noc_other">Yes (Other TEER 0, 1, 2, or 3) (+50)</option> </Select> </div> <div> <Label>Study in Canada (Post-secondary)?</Label> <Select id="canadian_study_level" value={formData.canadian_study_level} onChange={handleInputChange}> <option value="no">No</option> <option value="1_or_2_years">Yes (1 or 2 year program) (+15)</option> <option value="3_years_or_more">Yes (3+ year program or Master's/Prof/PhD) (+30)</option> </Select> </div> <div> <Label>Sibling in Canada (Citizen/PR, 18+, living in Canada)?</Label> <RadioGroup className="flex space-x-4"> <RadioGroupItem id="sibling-no" name="sibling_in_canada" value="no" checked={formData.sibling_in_canada === 'no'} onChange={handleRadioChange}>No</RadioGroupItem> <RadioGroupItem id="sibling-yes" name="sibling_in_canada" value="yes" checked={formData.sibling_in_canada === 'yes'} onChange={handleRadioChange}>Yes (+15)</RadioGroupItem> </RadioGroup> </div> <div> <Label>French NCLC 7+ in all 4 skills? (Auto-calculated)</Label> <RadioGroup className="flex space-x-4"> <RadioGroupItem id="french-no" name="french_nclc7_all" value="no" checked={formData.french_nclc7_all === 'no'} onChange={() => {}} disabled>No</RadioGroupItem> <RadioGroupItem id="french-yes" name="french_nclc7_all" value="yes" checked={formData.french_nclc7_all === 'yes'} onChange={() => {}} disabled>Yes (+25 or +50 based on English CLB)</RadioGroupItem> </RadioGroup> <p className="text-xs text-gray-500 mt-1">Status determined by NCLC scores.</p> </div> </CardContent> </Card>
                  </div>
                  {/* Score Column (Right) */}
                  <div className="md:col-span-1">
                      <Card className="sticky top-8">
                          <CardHeader><CardTitle className="text-center">Estimated CRS Score</CardTitle></CardHeader>
                          <CardContent className="text-center">
                              <p className="text-5xl font-bold text-indigo-600 mb-6">{scores.total}</p>
                              <div className="text-left space-y-2 text-sm">
                                 <div className="flex justify-between"><span>A. Core / Human Capital:</span> <span>{scores.core_human_capital} / {hasSpouse ? 460 : 500}</span></div>
                                 <div className="flex justify-between"><span>B. Spouse Factors:</span> <span>{scores.spouse_factors} / 40</span></div>
                                 <div className="flex justify-between"><span>C. Skill Transferability:</span> <span>{scores.skill_transferability} / 100</span></div>
                                 <Separator />
                                 <div className="flex justify-between font-semibold"><span>Subtotal (A+B+C):</span> <span>{scores.core_human_capital + scores.spouse_factors + scores.skill_transferability} / 600</span></div>
                                 <Separator />
                                 <div className="flex justify-between"><span>D. Additional Points:</span> <span>{scores.additional_points} / 600</span></div>
                                 <Separator />
                                 <div className="flex justify-between font-bold text-base"><span>Total Estimated Score:</span> <span>{scores.total} / 1200</span></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-6"> Disclaimer: Unofficial estimate. Uses dropdowns for age/CWE. </p>
                              
                      </CardContent>
                      </Card>
                  </div>
              </div>
          )}

          {/* Projection Timeline Tab Content */}
          {activeTab === 'projection' && (
              <div className="space-y-6">
                   <Card>
                       <CardHeader><CardTitle>Projection Inputs</CardTitle></CardHeader>
                       <CardContent>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                             <div className="flex flex-col">
      <Label htmlFor="birthday">Date of Birth</Label>
      <Input id="birthday" type="date" value={formData.birthday} onChange={handleInputChange} />
    </div>
                             <div className="flex flex-col">
      <Label htmlFor="canadianWorkStartDate">Canadian Work Start Date</Label>
      <Input id="canadianWorkStartDate" type="date" value={formData.canadianWorkStartDate} onChange={handleInputChange} />
    </div>
  </div>
                           
                      </CardContent>
                   </Card>
                  <Card>
                     <CardHeader><CardTitle className="text-center">Score Projection Timeline (Next 5 Years)</CardTitle></CardHeader>
                     <CardContent>
                         <p className="text-xs text-center text-gray-500 mb-4">Shows score changes around birthdays & work anniversaries based on exact age and calculated CWE. Assumes other factors (from Calculator tab) remain constant.</p>
                         {(!formData.birthday || !formData.canadianWorkStartDate) && ( <p className="text-sm text-center text-gray-500">Enter Date of Birth and Canadian Work Start Date above to see projections.</p> )}
                         {timelineProjections.length > 0 && (
                             <div className="overflow-x-auto">
                                 <table className="w-full text-base text-left">
                                     <thead>
                                         <tr className="border-b bg-gray-50 text-lg">
                                             <th className="py-2 px-1 font-semibold">Date</th>
                                             <th className="py-2 px-1 font-semibold">Event Context</th>
                                             <th className="py-2 px-1 text-center font-semibold">Age</th>
                                             <th className="py-2 px-1 text-center font-semibold">CWE</th>
                                             <th className="py-2 pl-1 text-right font-semibold">Score</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {timelineProjections.map((proj, index) => (
                                             <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                 <td className="py-1.5 px-1">{proj.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                 <td className="py-1.5 px-1">{proj.label}</td>
                                                 <td className="py-1.5 px-1 text-center">{proj.age}</td>
                                                 <td className="py-1.5 px-1 text-center">{proj.cwe}yr{proj.cwe !== 1 ? 's' : ''}</td>
                                                 <td className="py-2 pl-2 font-semibold text-right">{proj.score}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         )}
                     </CardContent>
                  </Card>
              </div>
          )}
      {/* Score Over Time Chart Section */}
      {timelineProjections.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-center">Score Over Time (Chart)</CardTitle></CardHeader>
          <CardContent>
            <ScoreLineChart projections={timelineProjections} />
          </CardContent>
        </Card>
      )}
      </div> {/* End Conditional Content */}
    </div> // End of container
  );
}

export default App;
