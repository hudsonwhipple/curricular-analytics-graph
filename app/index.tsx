/**
 * URL parameter documentation
 *
 * - `major`: The first two characters are used to look up major-specific DFQ
 *   rates in `dfqRatesByMajor`.
 * - `defaults`: Either `ca` (for Curricular Analytics, which should match their
 *   original visualization) or `ucsd` (Carlos' preferred defaults).
 * - `hide-panel`: Whether to hide the side panel.
 * - `title`: A title to show at the top of the side panel.
 *
 * The URL fragment is used to store the degree plan to render.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, CourseStats } from './App'
import { csvStringToDegreePlan } from './util/parse-degree-plan'

///*
// import dfqRatesByMajor from './data/fake-dfq-by-major.json'
import dfqRatesByMajor from './data/ut-coursename-dfq-by-major.json'
import frequencies from './data/fake-frequency.json'
import waitlists from './data/fake-waitlist.json'
const equityGapsByMajor = { PHYS2CL: { allMajors: 'firstGen urm' } }
const realData = false
//*/
// import dfqRatesByMajor from '../../ExploratoryCurricularAnalytics/files/protected/summarize_dfq_by_major.json'
// import frequencies from '../../ExploratoryCurricularAnalytics/files/protected/summarize_frequency.json'
// import waitlists from '../../ExploratoryCurricularAnalytics/files/protected/summarize_waitlist.json'
// import equityGapsByMajor from '../../ExploratoryCurricularAnalytics/files/protected/summarize_equity_by_major.json'
// const realData = true
//*/

// https://curricularanalytics.org/degree_plans/11085
// import example from './data/example.json'
// https://curricularanalytics.org/degree_plans/25144
// import example from './data/SY-Degree Plan-Eighth-EC27.csv'
import example from './data/BA_in_Economics.csv'
// https://curricularanalytics.org/degree_plans/25403
// import example from './data/EC27.json'

const { degreePlan, reqTypes } = csvStringToDegreePlan(
  window.location.hash.length > 1
    ? decodeURIComponent(window.location.hash.slice(1))
    : example
)
const params = new URL(window.location.href).searchParams
const majorSubject = params.get('major')?.slice(0, 2) ?? ''

type CourseDfwRates = {
  [majorSubject: string]: number | undefined
  allMajors: number
}

function getStats (courseName: string): CourseStats {
  const match = courseName.toUpperCase().match(/([A-Z]+) *(\d+[A-Z]*)/)
  const courseCode = match ? match[1] + match[2] : ''
  // const dfqRates = (dfqRatesByMajor as Record<string, CourseDfwRates>)[
  //   courseCode
  // ]
  const dfqRates = (dfqRatesByMajor as Record<string, CourseDfwRates>)[courseName]
  const equityGaps = (
    equityGapsByMajor as Record<string, Record<string, string>>
  )[courseCode]
  return {
    dfq: dfqRates?.[majorSubject] ?? dfqRates?.allMajors ?? null,
    dfqForDepartment: dfqRates?.[majorSubject] !== undefined,
    equityGaps:
      equityGaps?.[majorSubject] !== undefined
        ? equityGaps[majorSubject]
          ? equityGaps[majorSubject].split(' ')
          : []
        : equityGaps?.allMajors
          ? equityGaps.allMajors.split(' ')
          : [],
    equityGapsForDepartment: equityGaps?.[majorSubject] !== undefined,
    frequency: (frequencies as Record<string, string[]>)[courseCode] ?? null,
    waitlist: (waitlists as Record<string, number>)[courseCode] ?? null
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      initDegreePlan={degreePlan}
      initReqTypes={reqTypes}
      getStats={(courseName: string) => getStats(courseName)} // Pass prefix and number
      defaults={params.get('defaults') ?? ''}
      panelMode={
        params.has('hide-panel')
          ? {}
          : {
            title: params.get('title') ?? undefined,
            key: true,
            options: true,
            majorDfwNote: majorSubject !== ''
          }
      }
      realData={realData}
      year={+(params.get('year') ?? new Date().getFullYear())}
    />
  </StrictMode>
)
