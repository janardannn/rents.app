import Logo from "../logo";

export const NavBar = ({ logoHeight, logoWidth }: { logoHeight: number, logoWidth: number }) => {
    return (
        <>
            {/* <Logo height={logoHeight} width={logoWidth} /> */}
            {/* <div className="pointer-events-auto">
                <NavBar logoHeight={200} logoWidth={200} />
            </div> */}

            {/* search modal (not yet) + search button */}
            {/* <div className="flex flex-col items-center">
                <div className="search-modal mt-4 bg-white rounded-xl shadow-xl p-6 max-w-xl w-full pointer-events-auto cursor-pointer text-xl text-gray-500 border-none">
                    Discover best properties near you matching your needs
                </div>

                <button className="search-button pointer-events-auto cursor-pointer border border-dashed text-xl mt-4 bg-[#f75c5f] text-white rounded-xl py-2 px-4">
                    Find Properties
                </button>
            </div> */}
        </>
    )
}
export default NavBar;