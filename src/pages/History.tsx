import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Activity, Calendar, Clock, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { clearHistory } from '../store/slices/historySlice';
import { setDiagnosis } from '../store/slices/symptomSlice';
import { RISK_LABELS } from '../types/health';
import type { RiskLevel } from '../types/health';
import { useT } from '../i18n/useT';

const RISK_BADGE: Record<RiskLevel, string> = {
  safe: 'bg-success-100 text-success-700',
  monitor: 'bg-yellow-100 text-yellow-700',
  consult: 'bg-orange-100 text-orange-700',
  urgent: 'bg-danger-100 text-danger-700',
};

const RISK_BAR: Record<RiskLevel, string> = {
  safe: 'bg-success-500',
  monitor: 'bg-yellow-400',
  consult: 'bg-orange-500',
  urgent: 'bg-danger-500',
};

const History = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const records = useAppSelector((s) => s.history.records);
  const lang = useAppSelector((s) => s.settings.language);
  const t = useT();

  function viewDiagnosis(id: string) {
    const record = records.find((r) => r.id === id);
    if (record?.diagnosis) {
      dispatch(setDiagnosis(record.diagnosis));
      navigate('/diagnosis');
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <Header title={t('histTitle')} showProfile={false} />

      <div className="px-5 py-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex flex-col items-center justify-center text-center h-24">
            <Activity className="text-primary-500 mb-1" size={22} />
            <span className="text-xs text-slate-500 mb-0.5">{t('histTotalChecks')}</span>
            <span className="text-base font-bold text-primary-600">{records.length} {t('histTimes')}</span>
          </div>
          <div className="bg-success-50 rounded-2xl p-4 border border-success-100 flex flex-col items-center justify-center text-center h-24">
            <Calendar className="text-success-500 mb-1" size={22} />
            <span className="text-xs text-slate-500 mb-0.5">{t('histLastCheck')}</span>
            <span className="text-base font-bold text-success-600">
              {records.length > 0
                ? new Date(records[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                : '—'}
            </span>
          </div>
        </div>

        {/* Records list */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} /> {t('histRecentRecords')}
          </h2>
          {records.length > 0 && (
            <button
              onClick={() => dispatch(clearHistory())}
              className="flex items-center gap-1 text-xs text-danger-500 hover:text-danger-700 transition-colors"
            >
              <Trash2 size={13} /> {t('histClearAll')}
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="bg-surface-50 rounded-2xl p-8 flex flex-col items-center text-center border border-surface-200 border-dashed">
            <Activity size={36} className="text-slate-300 mb-3" />
            <p className="font-bold text-slate-600 mb-1">{t('histEmpty')}</p>
            <p className="text-xs text-slate-400 mb-4">{t('histEmptySub')}</p>
            <button
              onClick={() => navigate('/chat')}
              className="bg-primary-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            >
              {t('histFirstCheck')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const riskMeta = RISK_LABELS[record.riskLevel];
              return (
                <div
                  key={record.id}
                  className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${RISK_BAR[record.riskLevel]}`} />
                  <div className="pl-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(record.date).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGE[record.riskLevel]}`}>
                        {riskMeta[lang]}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base mb-1.5 capitalize">{record.primarySymptom}</h3>

                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {record.symptoms.slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] bg-surface-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                          {s}
                        </span>
                      ))}
                      {record.symptoms.length > 4 && (
                        <span className="text-[10px] bg-surface-100 text-slate-400 px-2 py-0.5 rounded-full">
                          +{record.symptoms.length - 4} more
                        </span>
                      )}
                    </div>

                    {record.diagnosis.diseaseRanking[0] && (
                      <p className="text-xs text-slate-500 mb-3">
                        {t('histPossible')}{' '}
                        <strong>{record.diagnosis.diseaseRanking[0].localName}</strong>{' '}
                        ({record.diagnosis.diseaseRanking[0].probability}%)
                      </p>
                    )}

                    <button
                      onClick={() => viewDiagnosis(record.id)}
                      className="w-full bg-primary-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-primary-600 transition-colors"
                    >
                      {t('histViewResult')} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-surface-50 border border-surface-200 border-dashed rounded-2xl p-4 flex gap-3 mt-5">
          <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">{t('histTip')}</p>
        </div>

      </div>
    </div>
  );
};

export default History;
