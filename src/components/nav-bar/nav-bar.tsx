import Logo from "../logo/logo";

export const NavBar = ({ logoHeight, logoWidth }: { logoHeight: number, logoWidth: number }) => {
    return (
        <Logo height={logoHeight} width={logoWidth} />
    )
}
export default NavBar;