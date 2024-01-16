import React from "react"

import * as styles from "./Dropdown.module.scss"

interface Option {
    key: string,
    value: string,
    img: React.ReactNode
}

interface DropdownProps<T> {
    options: Array<Option>;
    default: Option;
    onSelect(selected: Option): void
}

const Dropdown: React.FC<DropdownProps<T>> = (props) => {
    const [selected, setSelected] = React.useState<Option>(props.default)
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
            <button onClick={onClick} className={styles.button}>
                <span className={styles.buttonImg}>{selected.img}</span>
                <span className={styles.buttonValue}>{selected.value}</span>
            </button>
            {isOpen
                ? (
                    <ul className={styles.menu} ref={menuRef}>
                        {props
                            .options
                            .map(option => {
                                return (
                                    <li
                                        key={option.key}
                                        onClick={
                                            () => {
                                                setSelected(option)
                                                props.onSelect(option);
                                                onClick()
                                            }
                                        }
                                        className={styles.option}
                                    >
                                        <span className={styles.optionImg}>{option.img}</span>
                                        <span className={styles.optionValue}>{option.value}</span>
                                    </li>
                                )
                            })}
                    </ul>
                )
                : null
            }
        </div>
    )
}

export { Dropdown }