const Footer = () => {
    return (
        <div className="flex flex-col justify-center mt-auto">
            <div className="border-t-2 mb-2 border-gray-200 py-3 mt-12">
                <p className="text-center">
                    DocConnect | All rights reserved, {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};
export default Footer;
