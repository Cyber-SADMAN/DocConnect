import { Toast, toast } from 'react-hot-toast';

const CustomToast = ({
    errors,
    t,
}: {
    errors: { [key: string]: string };
    t: Toast;
}) => {
    const errorList: string[] = Object.values(errors);

    return (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-[#333] shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}
        >
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Errors</h3>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="bg-red-600 text-white rounded-full p-1"
                >
                    <span className="sr-only">Close</span>
                    <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            </div>
            <div className="px-4 py-3">
                <ul className="space-y-2 list-disc pl-4">
                    {errorList.map((error: string, index: number) => (
                        <li key={index} className="text-white">
                            {error}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CustomToast;
