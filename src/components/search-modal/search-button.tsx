interface SearchButtonProps {
    loading?: boolean;
}

const SearchButton = ({ loading }: SearchButtonProps) => {
    return (
        <button className="search-button pointer-events-auto cursor-pointer border border-dashed text-xl mt-4 bg-[#f75c5f] text-white rounded-xl py-2 px-4">
            {loading ? "Searching..." : "Find Properties"}
        </button>
    )
}

export default SearchButton;
