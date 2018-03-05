import React from 'react';
class MyComponent extends React.Component {
    render() {
        const a = this.props;
        return (<div className="asd">
            <h1>Title</h1>
            {
                a
            }
            <ul>
                {
                    a.filter(item=>item>10).map(asd => (<li key={asd.key}>{asd}<text>asd</text></li>))
                }
            </ul>
            {
                children
            }
            <h3>And here we go</h3>
    </div>)
    }
}
