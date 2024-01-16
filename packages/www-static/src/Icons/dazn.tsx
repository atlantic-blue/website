import React from "react"

interface DaznProps {
    className: string
}

const Dazn: React.FC<DaznProps> = props => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            <path
                d="M147.74 82.91l7.716-25.964 7.906 25.964H147.74zm38.48 22.68l-20.253-61.28c-.451-1.351-.965-2.239-1.541-2.655-.581-.416-1.515-.628-2.798-.628H150.44c-1.287 0-2.232.228-2.845.675-.611.448-1.11 1.32-1.495 2.608l-20.444 61.28c-.259.323-.384.959-.384 1.925 0 1.484.899 2.222 2.7 2.222h8.389c.773 0 1.397-.032 1.879-.094.483-.063.868-.228 1.159-.487.29-.252.544-.644.772-1.155.224-.518.464-1.193.722-2.026l3.183-10.712h23.05l3.276 10.516c.259.903.514 1.61.773 2.128.255.51.546.91.867 1.202.322.29.706.47 1.158.534.447.062 1.028.094 1.734.094h8.97c1.798 0 2.7-.738 2.7-2.222 0-.448-.015-.755-.047-.911-.036-.165-.145-.503-.337-1.014zm-9.944 24.672h-6.463c-1.672 0-2.783.243-3.327.723-.546.486-.817 1.468-.817 2.945v36.377l-19.094-36.472c-.773-1.546-1.53-2.529-2.268-2.944-.741-.417-2.04-.629-3.905-.629h-5.98c-1.671 0-2.782.243-3.327.723-.546.486-.82 1.468-.82 2.945v61.374c0 1.485.255 2.459.772 2.946.514.478 1.606.722 3.277.722h6.561c1.668 0 2.778-.244 3.324-.722.545-.487.82-1.46.82-2.946v-36.48l19.094 36.574c.773 1.548 1.526 2.53 2.268 2.946.738.423 2.04.628 3.904.628h5.98c1.672 0 2.779-.244 3.328-.722.545-.487.82-1.46.82-2.946V133.93c0-1.477-.275-2.459-.82-2.945-.55-.48-1.656-.723-3.327-.723zm32.03-5.811l16.65 16.65v83.855H15.045v-83.869l16.634-16.634a6.297 6.297 0 0 0 0-8.906L15.044 98.913v-83.87h209.913v83.851l-16.65 16.651a6.297 6.297 0 0 0 0 8.906zM240 0H0v106.133L13.867 120 0 133.867V240h240V133.867L226.134 120 240 106.133V0zM106.703 184.687h-27.11l28.548-40.14c.449-.644.74-1.161.87-1.547.13-.384.193-.832.193-1.35v-7.72c0-1.477-.276-2.459-.823-2.945-.547-.48-1.662-.723-3.339-.723H63.823c-1.485 0-2.45.275-2.902.817-.452.55-.677 1.688-.677 3.432v5.788c0 1.735.225 2.882.677 3.424.452.55 1.417.824 2.902.824h25.445l-28.157 40.14c-.713.903-1.068 1.806-1.068 2.701v7.916c0 1.485.276 2.459.823 2.946.548.478 1.662.722 3.34.722h42.497c1.484 0 2.453-.275 2.906-.817.449-.55.677-1.689.677-3.432v-5.787c0-1.737-.228-2.875-.677-3.424-.453-.55-1.422-.825-2.906-.825zM94.084 82.328c0 2.64-.176 4.846-.53 6.613-.353 1.767-.93 3.204-1.734 4.296-.804 1.091-1.864 1.861-3.183 2.317-1.318.447-2.942.675-4.87.675h-7.906V54.535h7.907c3.665 0 6.298 1.084 7.907 3.235 1.605 2.153 2.41 5.71 2.41 10.665v13.893zm13.793-27.888c-2.252-4.57-5.32-7.947-9.21-10.13-3.892-2.191-8.793-3.283-14.707-3.283H64.19c-1.672 0-2.782.243-3.328.723-.545.486-.82 1.468-.82 2.945v61.374c0 1.485.275 2.458.82 2.946.546.478 1.656.722 3.328.722h22.178c10.481 0 17.65-4.469 21.508-13.414.898-2.057 1.526-4.13 1.88-6.228.353-2.089.529-4.743.529-7.955V69.111c0-3.668-.176-6.565-.53-8.686a22.045 22.045 0 0 0-1.879-5.985z"
                fill="#fff"
                fillRule="nonzero">
            </path>
        </svg>

    )
}

export { Dazn }