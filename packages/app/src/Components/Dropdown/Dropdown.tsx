import React from "react"

import * as styles from "./Dropdown.scss"

interface DropdownProps<T> {
    button: string
    options: Array<{ key: string, value: string }>
    onSelect<T>(selected: T): void
}

const Dropdown: React.FC<DropdownProps<T>> = (props) => {
    const [isOpen, setOpen] = React.useState(false)
    const menuRef = React.useRef(null)

    const close = (event: MouseEvent) => {
        const concernedElement = document.querySelector(`.${styles.container}`)
        const hasClickedInside = concernedElement && concernedElement.contains(event.target as Node)

        if (!hasClickedInside) {
            setOpen(false)
        }
    }

    const onClick = () => {
        setOpen(prev => !prev)
    }


    React.useEffect(() => {
        document.addEventListener("click", close)

        return () => {
            document.removeEventListener("click", close)
        }
    }, [isOpen])

    return (
        <div className={styles.container}>
            <button onClick={onClick}
                className={styles.button}
            >
                {props.button}
            </button>
            {
                isOpen ? (
                    <ul className={styles.menu} ref={menuRef}>
                        {props.options.map(option => {
                            return (
                                <li key={option.key}
                                    onClick={() => {
                                        props.onSelect(option.key)
                                        onClick()
                                    }}>
                                    {option.value}
                                </li>
                            )
                        })}
                    </ul>
                ) : null
            }
        </div>
    )
}

export { Dropdown }