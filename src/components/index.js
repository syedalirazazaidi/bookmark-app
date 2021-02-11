import React from "react"

import styled from "styled-components"

import { useQuery, useMutation } from "@apollo/client"
import gql from "graphql-tag"
const BOOKMARK_QUERY = gql`
  {
    bookmark {
      url
      id
      description
    }
  }
`

const AddBookMarkMutation = gql`
  mutation addBookmark($url: String!, $description: String!) {
    addBookmark(url: $url, description: $description) {
      url
      description
    }
  }
`
const DELETE_BOOKMARK = gql`
  mutation removeBookmark($id: ID!) {
    removeBookmark(id: $id) {
      id
    }
  }
`
export default function BookMark() {
  const [text, setText] = React.useState("")
  const [addBookmark] = useMutation(AddBookMarkMutation)
  const [removeBookmark] = useMutation(DELETE_BOOKMARK)

  let input
  let desc

  const addBookmarkFunc = e => {
    if (input.value == "" || desc.value == "") {
      alert("plz enter all value")
    } else {
      addBookmark({
        variables: {
          url: input.value,
          description: desc.value,
        },
        refetchQueries: [{ query: BOOKMARK_QUERY }],
      })
    }

    input.value = ""
    desc.value = ""
  }
  const deleteTask = id => {
    removeBookmark({
      variables: { id },
      refetchQueries: [{ query: BOOKMARK_QUERY }],
    })
  }

  const { loading, error, data } = useQuery(BOOKMARK_QUERY)

  if (loading)
    return (
      <h2
        style={{
          marginTop: "60px",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        Loading...
      </h2>
    )

  if (error) {
    return <h2>Error</h2>
  }

  const Container = styled.div`
    width: 250px;
    margin: 10px auto;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    height: 80px;
    padding: 30px 20px;
    display: flex;
  `

  return (
    <>
      <Container>
        <form>
          <input
            placeholder="Enter Url"
            style={{
              padding: "8px",
              width: "240px",
              backgroundColor: "#fff98",
              margin: "5px 5px",
            }}
            ref={node => {
              input = node
            }}
          />
          <input
            placeholder="Enter Url Description"
            style={{
              padding: "8px",
              width: "240px",
              backgroundColor: "#fff98",
              margin: "5px",
            }}
            ref={node => {
              desc = node
            }}
          />
          <button
            type="submit"
            onClick={addBookmarkFunc}
            style={{
              padding: "5px 6px 5px 6px",
              marginTop: "10px",
              margin: "5px",
              justifyContent: "flex-end",
              background: "#332331",
              display: "flex",
              color: "#ffff",
            }}
          >
            Add Links
          </button>
        </form>
      </Container>
      <div
        style={{
          justifyContent: "center",
          // display: "flex",
          textAlign: "center",
          marginTop: "30px",
        }}
      >
        <h2>My BookMark Link</h2>
        <br />

        {
          <ul
            style={{
              listStyle: "none",
            }}
          >
            {data.bookmark.map(crud => {
              return (
                <div>
                  <li
                    key={crud.id}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "10px",
                    }}
                  >
                    <div style={{ padding: "5px 10px" }}>
                      {crud.url}
                      <br />
                      {crud.description}
                    </div>
                    <div style={{ padding: "5px 10px" }}>
                      <button
                        style={{ padding: "5px 10px" }}
                        onClick={() => deleteTask(crud.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                </div>
              )
            })}
          </ul>
        }
      </div>
    </>
  )
}
