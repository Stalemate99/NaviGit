import React from 'react';

export default function App() {


    const setPreference = () => {

    }

    return (
        <div>
            <input defaultValue="Search repos" />
            <section>
                <button onClick={setPreference} >Set Preference</button>
                <p>Default option: Command + G</p>
            </section>
            <section>
                <h6>
                    Press Command + Q to quit applicaiton. 
                </h6>
            </section>
        </div>
    );
}