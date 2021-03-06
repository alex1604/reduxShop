import React, { Component } from "react";
import { connect } from "react-redux";
import "./Kundvagn.css";
import {
  actionDeleteFromBasket,
  actionDecreaseBy,
  actionIncreaseByOne,
  actionRemoveOneTable,
  actionAddToEmptyShoppingList,
  actionReturnTablesToStock,
  actionClearUndo,
} from "../actions/actions.js";

class Kundvagn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleDelete = this.handleDelete.bind(this);
  }
  handleUndoBasket = (event) => {
    if (this.props.shoppingbasket.lastDeleted.antal >= 1) {
      let produkt = this.props.shoppingbasket.lastDeleted;

      let action = actionAddToEmptyShoppingList({
        total:
          Number(this.props.shoppingbasket.total) +
          Number(produkt.pris * produkt.antal),
        object: produkt,
      });
      this.props.dispatch(action);

      let newStateProdukter = [...this.props.produkter];
      let index;

      for (let el in this.props.produkter) {
        if (this.props.produkter[el].namn === produkt.namn) {
          index = el;
        }
      }
      newStateProdukter[index].antal =
        newStateProdukter[index].antal - produkt.antal;
      let updateStock = actionRemoveOneTable(newStateProdukter);
      this.props.dispatch(updateStock);
      for (let i = 0; i < produkt.antal; i++) {
        this.props.dispatch(actionIncreaseByOne());
      }
      this.props.dispatch(actionClearUndo());
    }
  };
  handleDelete = (e) => {
    let index = e.target.id;
    let deduct =
      this.props.kundvagn[index].antal * this.props.kundvagn[index].pris;
    let newState = [...this.props.kundvagn];
    let lastDeleted = newState[index];

    let antal = lastDeleted.antal;
    let i;
    for (let el in this.props.produkter) {
      if (this.props.produkter[el].namn === lastDeleted.namn) {
        i = el;
      }
    }
    let newStateProdukter = [...this.props.produkter];
    newStateProdukter[i].antal = newStateProdukter[i].antal + antal;
    let returnTables = actionReturnTablesToStock(newStateProdukter);

    let action = actionDeleteFromBasket(newState, deduct, lastDeleted);
    this.props.dispatch(actionDecreaseBy(this.props.kundvagn[index].antal));
    this.props.dispatch(action);
    this.props.dispatch(returnTables);

    newState.splice(index, 1);
  };
  render() {
    let list = this.props.kundvagn.map((x, index) => (
      <div className="kundvagnItem" key={index}>
        <img src={require("../images/bord3.jpg")} alt="amazing table" />
        <div className="productInfo">
          <h4>
            {x.namn} ( <span className="smaller">{x.pris} EUR/ unit </span>)
          </h4>
          <h4>
            {x.antal} units = {x.pris * x.antal} EUR{" "}
            <i
              className="fa fa-trash fa-2x"
              id={index}
              onClick={this.handleDelete}
            ></i>
          </h4>
        </div>
      </div>
    ));

    return (
      <div id="kundvagn">
        <span className="fa fa-close fa-2x" onClick={this.props.close}></span>
        {list}
        <div id="totalPrice">
          <u>Total</u>: {this.props.shoppingbasket.total} incl. VAT
        </div>
        <button onClick={this.handleUndoBasket} className="cartUndoBtn">
          Undo remove
        </button>
      </div>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    produkter: state.produkter.present,
    kundvagn: state.kundvagn.previous,
    shoppingbasket: state.kundvagn,
  };
};
export default connect(mapStateToProps)(Kundvagn);
