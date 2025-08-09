import Image from 'next/image'

export const Logo = ({ height, width }: { height: number, width: number }) => {
    return (
        <Image
            onClick={() => {
                window.location.href = "/";
            }}
            className='cursor-pointer'
            src="/rents.app_final_logo.png"
            width={width}
            height={height}
            alt="rents.app img"
        />
    )
}

export default Logo;