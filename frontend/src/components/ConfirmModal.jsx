import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#D3D1C7]">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#FDF5F5] rounded-full flex items-center justify-center text-[#A32D2D] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#444441]">{title}</h3>
                <p className="mt-2 text-[14px] text-[#888780] leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#F1EFE8] px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="bg-[#A32D2D] hover:bg-[#791F1F] text-white rounded-lg px-5 py-2.5 text-[14px] font-semibold transition-colors"
            >
              {t('common.submit')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="border border-[#D3D1C7] hover:bg-[#E1F5EE] text-[#444441] rounded-lg px-5 py-2.5 text-[14px] font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
