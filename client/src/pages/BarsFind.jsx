import React, { Component } from 'react'
import ReactTable from 'react-table-6'
import styled from 'styled-components'
import 'react-table-6/react-table.css'
import api from '../api'

const FullName = styled.h1.attrs({ className: 'h1', })``
const Wrapper = styled.div.attrs({ className: 'form-group', })`
    margin: 0 30px;
`
const WrapperHeader = styled.div.attrs({ className: 'form-group', })`
    margin: 0 30px;
`
const WrapperFooter = styled.div.attrs({ className: 'form-group bg-white', })`
    margin: 0 30px;
`
const WrapperUrl = styled.a.attrs({ className: 'navbar-brand' })`
  display: 'flex';
`
const Label = styled.label`
    margin: 5px;
`
const InputText = styled.input.attrs({ className: 'form-control', })`
    margin: 5px;
`
const Button = styled.button.attrs({ className: `btn btn-primary`, })`
    margin: 15px 15px 15px 5px;
`
const Join = styled.div` color: #ff0000; cursor: pointer; `

class JoinBar extends Component {
  joinUser = async event => {
    event.preventDefault()
    const { id, find_id, ip, twitterId } = this.props
    if (window.confirm(`Do tou want to confirm your assistance to this bar tonight?`,)) {

      const payload = {
        find_id: find_id,
        business_id: id,
        ip: ip,
        twitterId: twitterId,
        date: new Date(),
        assist: true,
      }
      await api.insertBar(payload)
      .catch(error => {
        console.log(error)
      })

      //window.location.href = '/'
    }
  }
  render() {
    return <Join onClick={this.joinUser}>I'll be here tonight!</Join>
  }
}

class BarsFind extends Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            location: '',
            json: { businesses: [], },
            locale: '',
            find_id: '',
            isLoading: false,
            authenticated: '',
            twitterId: '',
            ip: '',
            user: '',
        }
    }
    componentDidMount = async () => {
        this.setState({ isLoading: true })

        var ip = ''
        await fetch("/api/auth/login/success", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept:
            "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true
          }
        })
          .then(response => {
            if (response.status === 200) return response.json()
            throw new Error("failed to authenticate user")
          })
          .then(responseJson => {
            ip = responseJson.ip
            if (responseJson.success === true) {
              this.setState({
                authenticated: true,
                twitterId: responseJson.user.twitterId,
                user: responseJson.user,
                ip: responseJson.ip,
                locale: responseJson.locale,
              })
            } else {
              this.setState({
                authenticated: false,
                twitterId: '',
                user: '',
                ip: responseJson.ip,
                locale: responseJson.locale,
              })
            }
          })
          .catch(error => {
            console.log(error)
          })

        await this.addUserIp(ip)

        this.setState({ isLoading: false })
    }
    addUserIp = async (ip) => {
      if (ip) {
        const currentUser = await api.getUserByIp(ip).catch(err => console.log(err))
        if (!currentUser) {
          //console.log('New User')
          const payload = {
            ip: ip,
            votes: [],
          }
          const newUser = await api.insertUser(payload).catch(err => console.log(err))
          if (newUser) {
            //console.log('New User created')
            //done(null, newUser)
          } else {
            //console.log("New User don't created")
          }
        } else {
          //console.log('User exists')
        }
      } else {
        //console.log('IP empty')
      }
    }
    handleSearch = async (event) => {
      event.preventDefault();
      const { location, locale, ip, twitterId, } = this.state
      if (!location) return
      var insertJson ={}

      await api.getYelpSearch('nightlife', location, locale)
        .then(result => {
          insertJson = result.data.data
          this.setState({
            json: result.data.data,
          })
        })
        .catch(error => {
          console.log(error)
        })

      const payload = {
        location: location,
        categories: 'nightlife',
        locale: locale,
        json: JSON.stringify(insertJson),
        ip: ip,
        twitterId: twitterId,
      }
      await api.insertFind(payload)
        .then(result => {
          this.setState({
            find_id: result.data._id,
          })
        })
        .catch(error => {
          console.log(error)
        })
    }
    handleChangeInputSearch(event) {
      const location = event.target.value
      this.setState({ location })
    }
    handleKeyPress(event) {
      if (event.key === "Enter") {
        this.handleSearch(event)
      }
    }
    render() {
      console.log('finds', this.state)
        const { json, isLoading, location, find_id, ip, twitterId, } = this.state
        const columns = [
            {
                Header: 'Bar',
                accessor: 'name',
                filterable: true,
            },

            {
                Header: 'Picture',
                accessor: '',
                Cell: function(props) {
                  return (
                      <span>
                        <WrapperUrl href={props.original.url} target="_blank">
                          <img src={props.original.image_url} width="100" height="100" alt={props.original.alias} />
                        </WrapperUrl>
                      </span>
                  )
                }
            },
            {
                Header: 'Address',
                accessor: '',
                Cell: function(props) {
                  return (
                      <span>
                      { props.original.location.display_address.length > 0 ?
                        (
                          <><Label>{ props.original.location.display_address.join(" / ") }</Label><br /></>
                        ): (
                          <div></div>
                        )
                      }
                      </span>
                  )
                }
            },
            {
                Header: 'Phone Number',
                accessor: '',
                Cell: function(props) {
                  return (
                      <span>
                      { props.original.display_phone ?
                        (
                          <><Label>{ props.original.display_phone }</Label><br /></>
                        ): (
                          <div></div>
                        )
                      }
                      </span>
                  )
                }
            },
            {
                Header: '',
                accessor: '',
                Cell: function(props) {
                  return (
                      <span>
                        <Label>{ props.original.is_closed ? 'Closed' : 'OPEN' }</Label><br />
                        { props.original.review_count > 0 ?
                          (
                            <><Label>Reviews: { props.original.review_count }</Label><br /></>
                          ): (
                            <div></div>
                          )
                        }
                        { props.original.categories.length > 0 ?
                          (
                            <><Label>Categories: { props.original.categories.map((item, index) => item.title).join(" / ") }</Label><br /></>
                          ): (
                            <div></div>
                          )
                        }
                        { props.original.rating > 0 ?
                          (
                            <><Label>Rating: { props.original.rating }</Label><br /></>
                          ): (
                            <div></div>
                          )
                        }
                        { props.original.transactions.length > 0 ?
                          (
                            <><Label>Transactions: { props.original.transactions.join(" / ") }</Label><br /></>
                          ): (
                            <div></div>
                          )
                        }
                        { props.original.price ?
                          (
                            <><Label>Price: { props.original.price }</Label><br /></>
                          ): (
                            <div></div>
                          )
                        }
                      </span>
                  )
                }
            },
            {
                Header: 'Assistance',
                accessor: '',
                Cell: function(props) {
                  return (
                      <span>
                      { true ?
                        (
                          <><JoinBar  /><br /></>
                        ): (
                          <div></div>
                        )
                      }
                      </span>
                  )
                }
            },
        ]

        let showTable = true
        if (!json.businesses.length) {
            showTable = false
        }

        return (
            <Wrapper>
              <WrapperHeader>
                <FullName>What's going on tonight</FullName>
                <hr />
                <InputText
                    type="text"
                    value={location}
                    placeholder="You can location for Location (Example: 'New York' or 'Denver')..."
                    onChange={this.handleChangeInputSearch.bind(this)}
                     onKeyPress={this.handleKeyPress.bind(this)}
                />

                <Button id="locationButton" onClick={this.handleSearch}>Search!</Button>
              </WrapperHeader>
              <WrapperFooter>
                {showTable && !isLoading && (
                    <ReactTable
                        data={json.businesses}
                        columns={columns}
                        loading={isLoading}
                        defaultPageSize={10}
                        showPageSizeOptions={true}
                        minRows={0}
                    />
                )}

                {!showTable && (
                    <hr />
                )}

                {isLoading && (
                    <h3>Loading Data</h3>
                )}
              </WrapperFooter>
            </Wrapper>
        )
    }
}

export default BarsFind
