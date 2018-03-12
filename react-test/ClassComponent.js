class MyComponent extends React.Component {
  render() {
    const { items, someText} = this.props;
    const b = items;
    return (
      <div className="myAwesomeClass">
      <h1>Title</h1>
    {b}
  <ul>
    {items
      .filter(item => item > 10)
      .map(x => x * 2)
      .map(asd => <li key={asd.key}>{asd}</li>)}
    </ul>
    <h3>And here we go</h3>
    </div>
  );
  }
}
