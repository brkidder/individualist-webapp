import React, { useContext, useState, useRef } from "react";
import { GlobalContext } from "../../context/GlobalState";
import { Ingredients } from "./Ingredients";
import { CheveronSvg } from "../SVG/CheveronSvg";
import { SelectRecipeButton } from "./SelectRecipeButton";
import { List, AccordionButton, DeleteButton, Link, AccordionContent, Input, Label } from "../../elements/index";
import styled from "styled-components";

// Styled Components
const Ul = styled.ul`
    width: 100%;
    list-style: none;
    margin-left: 10px;
    padding: 1vw;
`;

const Li = styled.li`
    display: inline-block;
    width: ${(props) => (props.large ? "45%" : "27.5%")};
    text-align: ${(props) => (props.large ? "center" : "right")};
    @media (max-width: 768px) {
        width: ${(props) => (props.large ? "60%" : "40%")};
        text-align: center;
        float: ${(props) => (props.large ? "left" : "right")};
    }
    padding: 5px 0px 5px 0px;
    cursor: pointer;
`;

const StyledLink = styled(Link)`
    color: blue;
    font-size: 75%;
`;

const Span = styled.span`
    color: blue;
    font-size: 75%;
    &:hover {
        cursor: pointer;
    }
    /* margin-left: ${(props) => (props.isSave ? "10px" : "")}; */
`;
const RightDiv = styled.div`
    float: right;
`;

const Wrapper = styled.div`
    display: block;
    width: 100%;
`;

const OptionsWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
`;

/*
    SUMMARY:
        Display non ingredient recipe attributes.  Allow delete recipe  
        Create accordion content containing ingredients.
        Create the recipe obj which will be used to display edit and replace recipe on save.

    PARAMS: 
        recipe: recipe to display 

*/
export const Recipe = ({ recipe }) => {
    // Context
    const { deleteRecipe, saveEditedRecipe } = useContext(GlobalContext);

    // State
    const [setActive, setActiveState] = useState(false);
    const [setHeight, setHeightState] = useState("0px");
    const [setRotate, setRotateState] = useState("");
    const [recipeObj, setRecipeObj] = useState({ active: false, recipe: recipe, editRecipe: {} });
    const [showIngredients, setShowIngredients] = useState(false);

    //Functions
    const toggleShowIngredients = () => {
        setActiveState(!showIngredients);
        setShowIngredients(!showIngredients);
        setRotateState(setActive ? "" : "rotate");
    };
    // Edit: clone recipe to use for edint and togle accordion open
    // Save: replace recipe with editRecipe
    // Cancel: delete edit recipe
    const handleEditingClicks = (type) => {
        // On eddit set active to true and clone recipe object to edit
        if (type === "edit") {
            setRecipeObj({ ...recipeObj, active: true, editRecipe: recipeObj.recipe });
            if (!setActive) {
                toggleShowIngredients();
            } else {
                setHeightState(`${recipeObj.recipe.ingredients.length * 58 + 10}px`);
            }

            // On save set active to false and replace recipe with cloned/edited version
        } else {
            if (type === "save") {
                saveEditedRecipe(recipeObj.editRecipe);
                setRecipeObj({ ...recipeObj, active: false, recipe: recipeObj.editRecipe, editRecipe: {} });
                //On Cancel set active to false and deleted clone
            } else if (type === "Cancel") {
                setRecipeObj({ ...recipeObj, active: false, editRecipe: {} });
            }
            setHeightState(`${recipeObj.recipe.ingredients.length * 58 + 144}px`);
        }
    };

    const qualifiedWebsiteFunc = () => {
        let url = recipeObj.recipe.URL;
        if (!/^https?:\/\//i.test(url)) {
            url = "http://" + url;
        }
        return url;
    };
    const website = qualifiedWebsiteFunc();
    // Display recipe options and links above recipe
    // display recipe attributes in button
    // accordion content: ingredients
    // If in eding mode display editRecipe values
    return (
        <>
            <Wrapper isRecipe>
                {!recipeObj.active ? (
                    <>
                        <SelectRecipeButton active={recipeObj.recipe.addToShoppingList} recipe_id={recipeObj.recipe._id} />
                        <OptionsWrapper>
                            <StyledLink text="Website" href={website} target="_blank" />
                            <RightDiv>
                                <Span onClick={() => deleteRecipe(recipeObj.recipe._id)}>Delete</Span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <Span onClick={() => handleEditingClicks("edit")}>Edit</Span>
                            </RightDiv>
                        </OptionsWrapper>
                    </>
                ) : (
                    <OptionsWrapper>
                        <Input
                            isRecipeWebsite
                            type="text"
                            placeholder="Enter URL..."
                            value={recipeObj.editRecipe.URL || ""}
                            onChange={(e) => setRecipeObj({ ...recipeObj, editRecipe: { ...recipeObj.editRecipe, URL: e.target.value } })}
                        />
                        <RightDiv>
                            <Span isSave onClick={() => handleEditingClicks("Save")}>
                                Save
                            </Span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Span isEdit onClick={() => handleEditingClicks("Cancel")}>
                                Cancel
                            </Span>
                        </RightDiv>
                    </OptionsWrapper>
                )}

                <AccordionButton active={showIngredients} onClick={() => !recipeObj.active && toggleShowIngredients()}>
                    <List active={setActive || recipeObj.active} ingredientCount={recipeObj.recipe.ingredients.length} isRecipe>
                        <Ul>
                            {!recipeObj.active ? (
                                <>
                                    <Li large key="name">
                                        {recipeObj.recipe.name}
                                    </Li>
                                    <Li med key="servings">
                                        Servings: {recipeObj.recipe.servings}
                                    </Li>
                                    <Li med key="ingredientCount">
                                        Ingredients: {recipeObj.recipe.ingredients.length} &nbsp;&nbsp;
                                        <CheveronSvg rotate={setRotate} />
                                    </Li>
                                </>
                            ) : (
                                <>
                                    <Li large key="name">
                                        <Input
                                            type="text"
                                            placeholder="Enter Name..."
                                            value={recipeObj.editRecipe.name || ""}
                                            onChange={(e) => setRecipeObj({ ...recipeObj, editRecipe: { ...recipeObj.editRecipe, name: e.target.value } })}
                                        />
                                    </Li>
                                    <Li med key="servings">
                                        <Label isRecipeServings>Servings</Label>
                                        <Input
                                            isRecipeServings
                                            type="number"
                                            min="1"
                                            max="99"
                                            value={recipeObj.editRecipe.servings || 1}
                                            onChange={(e) => setRecipeObj({ ...recipeObj, editRecipe: { ...recipeObj.editRecipe, servings: e.target.value } })}
                                            placeholder="Enter Servings..."
                                        />
                                    </Li>
                                    <Li med key="ingredientCount">
                                        Ingredients: {recipeObj.recipe.ingredients.length} &nbsp;&nbsp;
                                        <CheveronSvg rotate={setRotate} />
                                    </Li>
                                </>
                            )}
                        </Ul>
                    </List>
                </AccordionButton>
            </Wrapper>
            {/* Accordion Content contains list of ingredients */}
            {showIngredients && (
                <AccordionContent>
                    <Ingredients recipeObj={recipeObj} setRecipeObjFunc={setRecipeObj} />
                </AccordionContent>
            )}
        </>
    );
};
