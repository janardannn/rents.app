import { useState } from "react";

const SearchModal = () => {
    const [visibility, setVisibility] = useState<boolean>(false);

    const handleClick = () => {
        setVisibility(!visibility);
        console.log("Search modal clicked");
    }
    return (
        <>
            <div
                onClick={handleClick}
                className="search-modal mt-4 bg-white rounded-xl shadow-xl p-6 max-w-xl w-full pointer-events-auto cursor-pointer text-xl text-gray-500 border-none">
                Discover best properties near you matching your checklist
            </div>
        </>
    )
}

export default SearchModal;